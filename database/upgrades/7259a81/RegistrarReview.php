<?php

final class RegistrarReview
{
    /** @return list<array{legacy_id:string,candidate_id:?string}> */
    public static function exceptions(Store $store): array
    {
        $grades = $store->table($store->source, 'grades');
        $query = $store->db->prepare(<<<SQL
            WITH visible AS (
                SELECT id, enrolment_id, revision, approved_by, moderation_status,
                    ROW_NUMBER() OVER (PARTITION BY enrolment_id ORDER BY revision DESC) AS position_in_history
                FROM {$grades} WHERE published_at <= ? AND approved_at IS NOT NULL
            )
            SELECT v.id AS legacy_id, (
                SELECT c.id FROM visible c WHERE c.enrolment_id=v.enrolment_id
                AND c.approved_by IS NOT NULL AND c.moderation_status='approved'
                ORDER BY c.revision DESC LIMIT 1
            ) AS candidate_id
            FROM visible v WHERE v.position_in_history=1
            AND (v.approved_by IS NULL OR v.moderation_status IS NULL OR v.moderation_status <> 'approved')
            ORDER BY v.id
            SQL);
        $query->execute([gmdate('Y-m-d H:i:s').($store->engine === 'pgsql' ? '+00' : '')]);

        return $query->fetchAll(PDO::FETCH_ASSOC);
    }

    private static function directory(): string
    {
        $dir = realpath((string) getenv('UPGRADE_REVIEW_DIR'));
        $root = dirname(__DIR__, 3);
        if (! getenv('UPGRADE_REVIEW_DIR') || ! $dir || ! is_dir($dir)
            || (fileperms($dir) & 0777) !== 0700 || $dir === $root || str_starts_with($dir, $root.'/')) {
            throw new RuntimeException('Registrar review needs a private directory outside the checkout.');
        }

        return $dir;
    }

    /** @param list<array{legacy_id:string,candidate_id:?string}> $cases */
    public static function report(string $plan, array $cases): void
    {
        $rows = array_map(fn (array $row): array => $row + ['decision' => 'unresolved', 'case_ref' => ''], $cases);
        $bytes = json_encode(['plan' => $plan, 'cases' => $rows], JSON_THROW_ON_ERROR | JSON_PRETTY_PRINT).PHP_EOL;
        umask(0077);
        $file = @fopen(self::directory().'/review.json', 'xb');
        if (! $file || fwrite($file, $bytes) !== strlen($bytes) || ! fclose($file)) {
            throw new RuntimeException('Cannot create a new private registrar report.');
        }
    }

    /** @param list<array{legacy_id:string,candidate_id:?string}> $cases */
    public static function authorize(string $plan, array $cases): ?string
    {
        if ($cases === []) {
            return null;
        }
        $dir = self::directory();
        $bytes = @file_get_contents($dir.'/review.json');
        $signature = @file_get_contents($dir.'/review.sig');
        $path = getenv('UPGRADE_REGISTRAR_PUBLIC_KEY');
        $key = $path ? @file_get_contents($path) : false;
        if (! $bytes || ! $signature || ! $key || @openssl_verify($bytes, $signature, $key, OPENSSL_ALGO_SHA256) !== 1) {
            throw new RuntimeException('Valid registrar signature required.');
        }
        $review = json_decode($bytes, true);
        $rows = $review['cases'] ?? null;
        if (($review['plan'] ?? null) !== $plan || ! is_array($rows) || ! array_is_list($rows) || count($rows) !== count($cases)) {
            throw new RuntimeException('Incomplete or stale registrar review.');
        }
        foreach ($cases as $i => $case) {
            $row = $rows[$i];
            if (! is_array($row) || ($row['legacy_id'] ?? null) !== $case['legacy_id']
                || ! array_key_exists('candidate_id', $row) || $row['candidate_id'] !== $case['candidate_id']
                || ($row['decision'] ?? null) !== 'accept_candidate_visibility'
                || ! is_string($row['case_ref'] ?? null) || ! preg_match('/^[A-Za-z0-9_-]{1,64}$/D', $row['case_ref'])) {
                throw new RuntimeException('Unresolved registrar case.');
            }
        }

        return hash('sha256', $bytes);
    }
}
