<?php

final class Store
{
    public readonly PDO $db;

    public readonly string $engine;

    public readonly string $source;

    public readonly string $target;

    public function __construct(string $dsn, string $source)
    {
        $this->engine = explode(':', $dsn, 2)[0];
        if (! in_array($this->engine, ['sqlite', 'pgsql', 'mysql'], true)) {
            throw new RuntimeException('Explicit target PDO DSN required.');
        }
        if ($this->engine === 'sqlite' && (! is_file(substr($dsn, 7)) || ! is_file($source)
            || realpath(substr($dsn, 7)) === realpath($source))) {
            throw new RuntimeException('Two existing distinct SQLite files required.');
        }
        $this->db = new PDO($dsn, getenv('UPGRADE_USER') ?: null, getenv('UPGRADE_PASSWORD') ?: null);
        $this->target = match ($this->engine) {
            'mysql' => $this->db->query('SELECT DATABASE()')->fetchColumn(),
            'pgsql' => 'public',
            'sqlite' => 'main',
        };
        $this->source = $this->engine === 'sqlite' ? 'legacy' : $source;
        $this->quote($this->source);
        $this->quote($this->target);
        if (strcasecmp($this->source, $this->target) === 0) {
            throw new RuntimeException('Source and destination coincide.');
        }
        if ($this->engine === 'sqlite') {
            $this->db->prepare('ATTACH DATABASE ? AS legacy')->execute(['file:'.str_replace('%2F', '/', rawurlencode(realpath($source))).'?mode=ro']);
            $this->db->exec('PRAGMA foreign_keys=ON');
        } elseif ($this->engine === 'mysql') {
            $this->db->exec('SET NAMES utf8mb4');
            $this->db->exec('SET SESSION information_schema_stats_expiry=0');
            $this->db->exec("SET SESSION foreign_key_checks=1, SESSION unique_checks=1, SESSION time_zone='+00:00'");
            $this->db->exec("SET SESSION sql_mode='STRICT_ALL_TABLES,NO_AUTO_VALUE_ON_ZERO'");
        } elseif ($this->db->query('SHOW session_replication_role')->fetchColumn() !== 'origin') {
            throw new RuntimeException('PostgreSQL origin constraint enforcement required.');
        }
    }

    public function quote(string $name): string
    {
        if (! preg_match('/^[a-z][a-z0-9_]*$/D', $name)) {
            throw new RuntimeException('Unsupported schema identifier.');
        }
        $q = $this->engine === 'mysql' ? '`' : '"';

        return $q.$name.$q;
    }

    public function table(string $schema, string $name): string
    {
        return $this->quote($schema).'.'.$this->quote($name);
    }

    /** @return array<string,list<string>> */
    public function inventory(string $schema): array
    {
        $columns = [];
        if ($this->engine === 'sqlite') {
            $tables = $this->db->query("SELECT name FROM {$schema}.sqlite_master WHERE type IN ('table','view') AND name NOT GLOB 'sqlite_*'");
            foreach ($tables->fetchAll(PDO::FETCH_COLUMN) as $table) {
                $q = $this->quote($table);
                $columns[$table] = $this->db->query("PRAGMA {$schema}.table_info({$q})")->fetchAll(PDO::FETCH_COLUMN, 1);
            }
        } else {
            $stmt = $this->db->prepare('SELECT table_name,column_name FROM information_schema.columns WHERE table_schema=?');
            $stmt->execute([$schema]);
            foreach ($stmt as [$table, $column]) {
                $columns[$table][] = $column;
            }
            if ($this->engine === 'mysql') {
                $stmt = $this->db->prepare("SELECT COUNT(*) FROM information_schema.tables WHERE table_schema=? AND COALESCE(engine,'') <> 'InnoDB'");
                $stmt->execute([$schema]);
                if ((int) $stmt->fetchColumn() !== 0) {
                    throw new RuntimeException('InnoDB tables required.');
                }
            }
        }
        ksort($columns, SORT_STRING);
        foreach ($columns as &$fields) {
            sort($fields, SORT_STRING);
        }

        return $columns;
    }

    /** @param list<string> $columns
     * @return array{count:int,sha256:string}
     */
    public function digest(string $schema, string $name, array $columns): array
    {
        $table = $this->table($schema, $name);
        $key = $this->quote(match ($name) {
            'cache', 'cache_locks' => 'key',
            'password_reset_tokens' => 'email',
            default => 'id',
        });
        $fields = implode(',', array_map($this->quote(...), $columns));
        $hash = hash_init('sha256');
        $count = 0;
        $last = null;
        do {
            $where = $last === null ? '' : "WHERE {$key} > ?";
            $stmt = $this->db->prepare("SELECT {$key},{$fields} FROM {$table} {$where} ORDER BY {$key} LIMIT 128");
            $stmt->execute($last === null ? [] : [$last]);
            $batch = 0;
            while ($row = $stmt->fetch(PDO::FETCH_NUM)) {
                $last = $row[0];
                hash_update($hash, serialize($row));
                $batch++;
                $count++;
            }
        } while ($batch === 128);

        return ['count' => $count, 'sha256' => hash_final($hash)];
    }
}
