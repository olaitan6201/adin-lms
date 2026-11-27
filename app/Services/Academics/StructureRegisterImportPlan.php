<?php

namespace App\Services\Academics;

use App\Enums\StructureRegisterKind;
use App\Models\AcademicProgramme;
use App\Models\Department;
use App\Models\Specialization;

final class StructureRegisterImportPlan
{
    public function __construct(private StructureImportCodeEquivalence $equivalence) {}

    public function build(array $rows, array $mapping, bool $lock = false): array
    {
        unset($rows[1]);
        $groups = [];
        $errors = [];
        $items = [];
        $seen = [];
        $programmes = [];
        $specializations = [];
        foreach ($rows as $line => $cells) {
            $row = StructureRegisterImportRow::fromCells($line, $cells, $mapping);
            if (is_string($row)) {
                $errors[$line] = $row;

                continue;
            }
            $groups[$row->kind->value][] = $row;
        }

        $lookup = new StructureRegisterImportLookup($this->equivalence, $lock);
        $lookup->prime(array_merge(...array_values($groups)));
        foreach (StructureRegisterKind::cases() as $kind) {
            $group = $groups[$kind->value] ?? [];
            usort($group, $this->compareRows(...));
            foreach ($group as $row) {
                $department = $row->department === '' ? null : $lookup->exact(Department::class, ['code' => $row->department]);
                if ($row->department !== '' && $department === null) {
                    $errors[$row->line] = 'Department code was not found.';

                    continue;
                }
                $programme = $row->programme === ''
                    ? null
                    : ($programmes[$row->programme] ?? $lookup->exact(AcademicProgramme::class, ['code' => $row->programme])?->id);
                $specialization = $specializations[$department?->id][$row->specialization] ?? null;
                if ($kind === StructureRegisterKind::Pathway && $specialization === null) {
                    $specialization = $lookup->exact(Specialization::class, ['department_id' => $department->id, 'code' => $row->specialization])?->id;
                }
                $item = $this->resolve($row, $lookup, $department?->id, $programme, $specialization, $seen);
                if (is_string($item)) {
                    $errors[$row->line] = $item;

                    continue;
                }
                $items[] = $item;
                $reference = $item['id'] ?? $row->line;
                if ($kind === StructureRegisterKind::Programme) {
                    $programmes[$row->code] = $reference;
                }
                if ($kind === StructureRegisterKind::Specialization) {
                    $specializations[$department->id][$row->code] = $reference;
                }
            }
        }

        ksort($errors);

        return ['items' => $items, 'errors' => $errors, 'dependencies' => $lookup->dependencies()];
    }

    private function resolve(
        StructureRegisterImportRow $row,
        StructureRegisterImportLookup $lookup,
        ?string $department,
        string|int|null $programme,
        string|int|null $specialization,
        array &$seen,
    ): array|string {
        if ($row->programme !== '' && $programme === null) {
            return 'Programme code was not found.';
        }
        if ($row->specialization !== '' && $specialization === null) {
            return 'Specialization code was not found in this department.';
        }
        $key = match ($row->kind) {
            StructureRegisterKind::Programme => ['code' => $row->code],
            StructureRegisterKind::Level => ['academic_programme_id' => $programme, 'code' => $row->code],
            StructureRegisterKind::Specialization => ['department_id' => $department, 'code' => $row->code],
            StructureRegisterKind::Pathway => ['specialization_id' => $specialization, 'academic_programme_id' => $programme],
        };
        $attributes = $key + match ($row->kind) {
            StructureRegisterKind::Programme, StructureRegisterKind::Specialization => ['name' => $row->name],
            StructureRegisterKind::Level => ['label' => $row->name, 'position' => $row->position],
            StructureRegisterKind::Pathway => [],
        };
        $model = StructureRegisterImportLookup::model($row->kind);
        $naturalKey = $lookup->naturalKey($model, $key);
        if (isset($seen[$model][$naturalKey])) {
            return 'This register key appears more than once in the spreadsheet.';
        }
        $seen[$model][$naturalKey] = true;
        $existing = $lookup->find($model, $key);
        if ($existing !== null) {
            foreach ($attributes as $field => $value) {
                if ($existing->getAttribute($field) !== $value) {
                    return 'This register key already exists with different values.';
                }
            }
        }

        return [
            'line' => $row->line,
            'kind' => $row->kind->value,
            'code' => $row->code,
            'name' => $row->name,
            'parent' => $row->parentLabel(),
            'position' => $row->position,
            'id' => $existing?->id,
            'key' => $key,
            'attributes' => $attributes,
        ];
    }

    private function compareRows(StructureRegisterImportRow $left, StructureRegisterImportRow $right): int
    {
        return strcmp($left->department, $right->department)
            ?: strcmp($left->programme, $right->programme)
            ?: strcmp($left->specialization, $right->specialization)
            ?: strcmp($left->code, $right->code)
            ?: ($left->line <=> $right->line);
    }
}
