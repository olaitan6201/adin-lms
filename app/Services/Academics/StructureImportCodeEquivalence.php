<?php

namespace App\Services\Academics;

use App\Enums\StructureUnit;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

final class StructureImportCodeEquivalence
{
    /** @var array<string, string> */
    private array $collations = [];

    public function key(StructureUnit $type, string $code): string
    {
        return $this->keyForTable($type->table(), $code);
    }

    public function keyForTable(string $table, string $code): string
    {
        $connection = DB::connection();
        if ($connection->getDriverName() !== 'mysql') {
            return 'code:'.$code;
        }

        if (! isset($this->collations[$table])) {
            $column = $connection->selectOne(
                'select collation_name as code_collation from information_schema.columns where table_schema = database() and table_name = ? and column_name = ?',
                [$table, 'code'],
            );
            $collation = $column?->code_collation;
            if (! is_string($collation) || ! preg_match('/\Autf8mb4_[a-z0-9_]+\z/', $collation)) {
                throw ValidationException::withMessages(['columns' => 'The structure code collation is not supported.']);
            }
            $this->collations[$table] = $collation;
        }
        $weight = $connection->selectOne(
            "select hex(weight_string(convert(? using utf8mb4) collate {$this->collations[$table]})) as key_weight",
            [$code],
        );

        return 'code:'.$weight->key_weight;
    }
}
