<?php

require __DIR__.'/Store.php';
require __DIR__.'/Transfer.php';
require __DIR__.'/UsageIndexes.php';

const BASELINE = '2026_11_25_000001_create_uuid_lms_schema';

$stage = 'preflight';
try {
    if ($argc !== 2 || ($argv[1] !== 'plan' && ! preg_match('/^apply:[a-f0-9]{64}$/D', $argv[1]))) {
        throw new RuntimeException('Expected plan or apply:<plan-sha256>.');
    }

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
        if (hash('sha256', json_encode($inventory, JSON_THROW_ON_ERROR)) !== $contract[$side]) {
            throw new RuntimeException("Unexpected {$side} table/column inventory.");
        }

        $ledger = $store->table($schema, 'migrations');
        if ($store->db->query("SELECT migration FROM {$ledger}")->fetchAll(PDO::FETCH_COLUMN) !== [BASELINE]) {
            throw new RuntimeException("Unexpected {$side} migration history.");
        }

        foreach ($inventory as $table => $columns) {
            if ($side === 'source') {
                $manifest['tables'][$table] = $store->digest($schema, $table, $columns);
            } elseif ($table !== 'migrations') {
                $name = $store->table($schema, $table);
                if ($store->db->query("SELECT 1 FROM {$name} LIMIT 1")->fetchColumn() !== false) {
                    throw new RuntimeException("Target {$table} is not empty.");
                }
            }
        }

        if ($side === 'source') {
            $original = $inventory;
        }
    }

    $token = hash('sha256', json_encode($manifest, JSON_THROW_ON_ERROR));
    if ($argv[1] === 'plan') {
        echo json_encode(['plan' => $token] + $manifest, JSON_PRETTY_PRINT | JSON_THROW_ON_ERROR).PHP_EOL;
        exit(0);
    }

    if (! hash_equals('apply:'.$token, $argv[1])) {
        throw new RuntimeException('Plan changed; review a fresh plan.');
    }

    if ($store->engine === 'mysql') {
        // MySQL counters are nontransactional. Set these only on the verified empty target.
        $transfer->sequences($manifest['next_ids']);
    }

    $store->db->beginTransaction();
    foreach ($contract['order'] as $table) {
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
    echo json_encode(['committed' => $token] + $manifest, JSON_PRETTY_PRINT | JSON_THROW_ON_ERROR).PHP_EOL;
} catch (Throwable $error) {
    if (isset($store) && $store->db->inTransaction()) {
        $store->db->rollBack();
    }

    $message = $error instanceof PDOException ? 'Database error '.$error->getCode() : $error->getMessage();
    fwrite(STDERR, "{$stage}: {$message}\n");
    exit(1);
}
