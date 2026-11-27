<?php

namespace App\Services\Academics;

use App\Enums\StructureUnit;
use App\Models\AuditLog;
use App\Models\DomainModel;
use App\Models\User;
use Illuminate\Validation\ValidationException;

final class StructureImport
{
    public const array FIELDS = ['kind', 'code', 'name', 'parent_code'];

    public function __construct(private StructureImportCodeEquivalence $equivalence) {}

    public function plan(array $rows, array $columns, bool $lock = false): array
    {
        $indexes = array_map(fn (string $field): int => (int) $columns[$field], self::FIELDS);
        if (count(array_unique($indexes)) !== count(self::FIELDS) || array_diff($indexes, array_keys($rows[1]))) {
            throw ValidationException::withMessages(['columns' => 'Map each field to a different spreadsheet column.']);
        }

        unset($rows[1]);
        $errors = [];
        $units = [];
        $seen = [];
        $resolved = [];
        foreach ($rows as $line => $cells) {
            [$kind, $code, $name, $parent] = array_map(fn (int $index): string => $cells[$index] ?? '', $indexes);
            $type = StructureUnit::tryFrom(strtolower($kind));
            if (! $type || $code === '' || $name === '' || max(mb_strlen($code), mb_strlen($name), mb_strlen($parent)) > 191) {
                $errors[$line] = 'Enter a valid kind, code and name (maximum 191 characters).';

                continue;
            }
            $key = $this->key($code);
            $folded = $this->equivalence->key($type, $code);
            if (isset($seen[$type->value][$folded])) {
                $errors[$line] = 'The code appears more than once for this kind.';

                continue;
            }
            $seen[$type->value][$folded] = true;
            $units[$type->value][$key] = compact('line', 'code', 'name', 'parent');
        }

        $items = [];
        foreach (StructureUnit::cases() as $type) {
            $group = $units[$type->value] ?? [];
            ksort($group);
            foreach ($group as $key => $row) {
                $item = $this->resolve($type, $row, $resolved, $lock);
                if (is_string($item)) {
                    $errors[$row['line']] = $item;

                    continue;
                }
                $resolved[$type->value][$key] = $item;
                $items[] = $item;
            }
        }

        ksort($errors);

        return compact('items', 'errors');
    }

    public function apply(User $actor, array $items): int
    {
        $ids = [];
        $created = 0;
        foreach ($items as $item) {
            $type = StructureUnit::from($item['kind']);
            $key = $this->key($item['code']);
            if ($item['id'] !== null) {
                $ids[$type->value][$key] = $item['id'];

                continue;
            }
            $attributes = ['code' => $item['code'], 'name' => $item['name']];
            $parent = $type->parent();
            if ($parent) {
                $attributes[$parent->value.'_id'] = $item['parentId'] ?? $ids[$parent->value][$this->key($item['parent'])];
            }
            $model = $type->model();
            $record = $model::query()->forceCreate($attributes);
            $id = $record->getKey();
            $ids[$type->value][$key] = $id;
            AuditLog::forceCreate([
                'actor_id' => $actor->id,
                'subject_key' => $record->getTable().':'.$id,
                'action' => 'organisation.imported',
                'occurred_at' => now(),
                'details' => ['row' => $item['line'], 'code' => $item['code']],
            ]);
            $created++;
        }

        return $created;
    }

    private function resolve(StructureUnit $type, array $row, array $resolved, bool $lock): array|string
    {
        $parent = $type->parent();
        if (($parent === null) !== ($row['parent'] === '')) {
            return $parent ? 'A parent code is required.' : 'Leave the parent code blank for a faculty.';
        }
        $parentItem = $parent ? ($resolved[$parent->value][$this->key($row['parent'])] ?? null) : null;
        $parentRecord = $parent && $parentItem === null ? $this->lookup($parent, $row['parent'], $lock) : null;
        if ($parent && $parentItem === null && $parentRecord?->code !== $row['parent']) {
            return 'Parent code was not found.';
        }
        $parentId = $parentItem['id'] ?? $parentRecord?->id;
        $existing = $this->lookup($type, $row['code'], $lock);
        if ($existing && ($existing->code !== $row['code'] || $existing->name !== $row['name']
            || ($parent && ($parentId === null || $existing->{$parent->value.'_id'} !== $parentId)))) {
            return 'This code already exists with a different name or parent.';
        }

        return $row + ['kind' => $type->value, 'id' => $existing?->id, 'parentId' => $parentId];
    }

    private function lookup(StructureUnit $type, string $code, bool $lock): ?DomainModel
    {
        $model = $type->model();
        $query = $model::query()->where('code', $code);
        if ($lock) {
            $query->lockForUpdate();
        }

        return $query->first();
    }

    private function key(string $code): string
    {
        return 'code:'.$code;
    }
}
