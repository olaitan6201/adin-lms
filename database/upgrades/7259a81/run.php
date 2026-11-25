<?php

require __DIR__.'/Store.php';
require __DIR__.'/Transfer.php';
require __DIR__.'/UsageIndexes.php';
require __DIR__.'/RegistrarReview.php';

const BASELINE = '2026_11_25_000001_create_uuid_lms_schema';

$stage = 'preflight';
try {
    if ($argc !== 2 || (! in_array($argv[1], ['plan', 'report'], true) && ! preg_match('/^(apply|cutover):[a-f0-9]{64}$/D', $argv[1]))) {
        throw new RuntimeException('Expected plan, report, apply:<plan-sha256> or cutover:<plan-sha256>.');
    }
    $cutover = str_starts_with($argv[1], 'cutover:');

    $dsn = (string) getenv('UPGRADE_DSN');
    $backup = (string) getenv('UPGRADE_BACKUP');
    if (! is_file($backup) || filesize($backup) === 0) {
        throw new RuntimeException('Restored, nonempty backup artifact required.');
    }

    $contract = json_decode(file_get_contents(__DIR__.'/contract.json'), true, flags: JSON_THROW_ON_ERROR);
    $migration = dirname(__DIR__, 3).'/database/migrations/'.BASELINE.'.php';
    if (glob(dirname($migration).'/*.php') !== [$migration] || hash_file('sha256', $migration) !== $contract['migration']) {
        throw new RuntimeException('Unreviewed target migration revision.');
    }

    $store = new Store($dsn, (string) getenv('UPGRADE_SOURCE'));
    UsageIndexes::verify($store, $contract['usage_indexes']);
    $transfer = new Transfer($store);
    $manifest = [
        'backup' => hash_file('sha256', $backup),
        'target_migration' => $contract['migration'],
        'location' => hash('sha256', $dsn."\0".getenv('UPGRADE_SOURCE')),
        'next_ids' => $transfer->nextIds(),
    ];
    foreach (['source', 'target'] as $side) {
        $schema = $store->$side;
        $inventory = $store->inventory($schema);
        $pins = $side === 'source' ? [$contract['source'], $contract['previous']] : [$contract['target']];
        $fingerprint = hash('sha256', json_encode($inventory, JSON_THROW_ON_ERROR));
        if (! in_array($fingerprint, $pins, true)) {
            throw new RuntimeException("Unexpected {$side} table/column inventory.");
        }

        $ledger = $store->table($schema, 'migrations');
        if ($store->db->query("SELECT migration FROM {$ledger}")->fetchAll(PDO::FETCH_COLUMN) !== [BASELINE]) {
            throw new RuntimeException("Unexpected {$side} migration history.");
        }

        foreach ($inventory as $table => $columns) {
            if ($side === 'source') {
                $manifest['tables'][$table] = $store->digest($schema, $table, $columns);
            } elseif ($cutover && isset($original[$table])) {
                if ($store->digest($schema, $table, $original[$table]) !== $manifest['tables'][$table]) {
                    throw new RuntimeException('Transferred data no longer matches source.');
                }
            } elseif ($table !== 'migrations') {
                $name = $store->table($schema, $table);
                if ($store->db->query("SELECT 1 FROM {$name} LIMIT 1")->fetchColumn() !== false) {
                    throw new RuntimeException("Target {$table} is not empty.");
                }
            }
        }

        if ($side === 'source') {
            $original = $inventory;
            $manifest['source_inventory'] = $fingerprint;
        }
    }

    $cases = RegistrarReview::exceptions($store);
    $manifest['history_exceptions'] = count($cases);
    $manifest['history_inventory'] = hash('sha256', json_encode($cases, JSON_THROW_ON_ERROR));
    $token = hash('sha256', json_encode($manifest, JSON_THROW_ON_ERROR));
    if ($argv[1] === 'report') {
        RegistrarReview::report($token, $cases);
        echo "Private registrar report created.\n";
        exit(0);
    }
    if ($argv[1] === 'plan') {
        echo json_encode(['plan' => $token] + $manifest, JSON_PRETTY_PRINT | JSON_THROW_ON_ERROR).PHP_EOL;
        exit(0);
    }

    if (! hash_equals(($cutover ? 'cutover:' : 'apply:').$token, $argv[1])) {
        throw new RuntimeException('Plan changed; review a fresh plan.');
    }
    $review = RegistrarReview::authorize($token, $cases);
    if ($cutover) {
        echo json_encode(['cutover_check' => $token, 'review_digest' => $review], JSON_THROW_ON_ERROR).PHP_EOL;
        exit(0);
    }

    if ($store->engine === 'mysql') {
        // MySQL counters are nontransactional. Set these only on the verified empty target.
        $transfer->sequences($manifest['next_ids']);
    }

    $store->db->beginTransaction();
    $order = array_intersect($contract['order'], array_keys($original));
    if (array_diff(array_keys($original), $order) !== []) {
        throw new RuntimeException('Missing table in transfer order.');
    }
    foreach ($order as $table) {
        $stage = "copy {$table}";
        $transfer->copy($table, $original[$table]);
    }

    foreach ($original as $table => $columns) {
        $stage = "reconcile {$table}";
        if ($store->digest($store->target, $table, $columns) !== $manifest['tables'][$table]) {
            throw new RuntimeException('Content or row-count mismatch.');
        }
    }

    if ($store->engine !== 'mysql') {
        $transfer->sequences($manifest['next_ids']);
    }

    $stage = 'commit';
    $store->db->commit();
    echo json_encode(['committed' => $token, 'review_digest' => $review] + $manifest, JSON_PRETTY_PRINT | JSON_THROW_ON_ERROR).PHP_EOL;
} catch (Throwable $error) {
    if (isset($store) && $store->db->inTransaction()) {
        $store->db->rollBack();
    }

    $message = $error instanceof PDOException ? 'Database error '.$error->getCode() : $error->getMessage();
    fwrite(STDERR, "{$stage}: {$message}\n");
    exit(1);
}
