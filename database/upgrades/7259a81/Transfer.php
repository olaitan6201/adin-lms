<?php

final class Transfer
{
    private const SELF_LINKS = ['offerings' => 'copied_from', 'posts' => 'parent_id'];

    public function __construct(private Store $store) {}

    /** @param list<string> $columns */
    public function copy(string $table, array $columns): void
    {
        $source = $this->store->table($this->store->source, $table);
        $target = $this->store->table($this->store->target, $table);
        $fields = array_map($this->store->quote(...), $columns);
        $names = implode(',', $fields);
        $link = self::SELF_LINKS[$table] ?? null;
        if ($link !== null) {
            $fields[array_search($link, $columns, true)] = 'NULL';
        }
        if ($table === 'migrations') {
            $this->store->db->exec("DELETE FROM {$target}");
        }
        $select = implode(',', $fields);
        $this->store->db->exec("INSERT INTO {$target} ({$names}) SELECT {$select} FROM {$source}");
        if ($link !== null) {
            $this->store->db->exec("UPDATE {$target} AS d SET {$link}=(SELECT s.{$link} FROM {$source} AS s WHERE s.id=d.id)");
        }
    }

    /** @return array<string,int> */
    public function nextIds(): array
    {
        $schema = $this->store->source;
        $next = [];
        foreach (['migrations', 'jobs', 'failed_jobs'] as $table) {
            $sql = match ($this->store->engine) {
                'sqlite' => "SELECT seq+1 FROM {$schema}.sqlite_sequence WHERE name='{$table}'",
                'mysql' => "SELECT auto_increment FROM information_schema.tables WHERE table_schema='{$schema}' AND table_name='{$table}'",
                'pgsql' => "SELECT last_value + CASE WHEN is_called THEN 1 ELSE 0 END FROM {$schema}.{$table}_id_seq",
            };
            $next[$table] = max(1, (int) $this->store->db->query($sql)->fetchColumn());
        }

        return $next;
    }

    /** @param array<string,int> $next */
    public function sequences(array $next): void
    {
        foreach ($next as $table => $id) {
            $target = $this->store->table($this->store->target, $table);
            if ($this->store->engine === 'sqlite') {
                $this->store->db->exec("DELETE FROM main.sqlite_sequence WHERE name='{$table}'");
                $this->store->db->exec("INSERT INTO main.sqlite_sequence(name,seq) VALUES ('{$table}',".($id - 1).')');
            } elseif ($this->store->engine === 'pgsql') {
                $this->store->db->exec("ALTER SEQUENCE public.{$table}_id_seq RESTART WITH {$id}");
            } else {
                $this->store->db->exec("ALTER TABLE {$target} AUTO_INCREMENT={$id}");
            }
        }
    }
}
