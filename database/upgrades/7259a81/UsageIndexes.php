<?php

/** Verify the target index keys independently of the migration ledger. */
final class UsageIndexes
{
    /** @param array<string,array<string,list<string>>> $expected */
    public static function verify(Store $store, array $expected): void
    {
        $sql = match ($store->engine) {
            'sqlite' => <<<'SQL'
                SELECT k.name FROM pragma_index_list(?, 'main') i, pragma_index_info(i.name, 'main') k
                WHERE i.name=? AND i."unique"=0 AND i.partial=0 ORDER BY k.seqno
                SQL,
            'mysql' => <<<'SQL'
                SELECT column_name FROM information_schema.statistics WHERE table_schema=DATABASE()
                AND table_name=? AND index_name=? AND non_unique=1 AND is_visible='YES'
                AND sub_part IS NULL AND index_type='BTREE' ORDER BY seq_in_index
                SQL,
            'pgsql' => <<<'SQL'
                SELECT a.attname FROM pg_index i JOIN pg_class t ON t.oid=i.indrelid
                JOIN pg_namespace n ON n.oid=t.relnamespace JOIN pg_class x ON x.oid=i.indexrelid
                CROSS JOIN LATERAL unnest(i.indkey) WITH ORDINALITY k(attnum, pos)
                JOIN pg_attribute a ON a.attrelid=t.oid AND a.attnum=k.attnum
                WHERE n.nspname='public' AND t.relname=? AND x.relname=? AND i.indisvalid
                AND NOT i.indisunique AND i.indpred IS NULL AND i.indexprs IS NULL
                AND k.pos <= i.indnkeyatts ORDER BY k.pos
                SQL,
        };
        $query = $store->db->prepare($sql);
        foreach ($expected as $table => $indexes) {
            foreach ($indexes as $name => $columns) {
                $query->execute([$table, $name]);
                if ($query->fetchAll(PDO::FETCH_COLUMN) !== $columns) {
                    throw new RuntimeException("Unexpected target index: {$name}.");
                }
            }
        }
    }
}
