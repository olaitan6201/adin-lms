<?php

namespace App\Services\Academics;

use App\Enums\StructureRegisterKind;
use Illuminate\Validation\ValidationException;

final readonly class StructureRegisterImportRow
{
    public const array FIELDS = ['kind', 'code', 'name', 'department_code', 'programme_code', 'specialization_code', 'position'];

    public function __construct(
        public int $line,
        public StructureRegisterKind $kind,
        public string $code,
        public string $name,
        public string $department,
        public string $programme,
        public string $specialization,
        public ?int $position,
    ) {}

    /** @return array<string, int> */
    public static function mapping(array $columns, array $headers): array
    {
        $mapping = [];
        foreach (self::FIELDS as $field) {
            $mapping[$field] = (int) $columns[$field];
        }
        if (count(array_unique($mapping)) !== count(self::FIELDS) || array_diff($mapping, array_keys($headers))) {
            throw ValidationException::withMessages(['columns' => 'Map each field to a different spreadsheet column.']);
        }

        return $mapping;
    }

    public static function fromCells(int $line, array $cells, array $mapping): self|string
    {
        $values = array_map(fn (int $index): string => $cells[$index] ?? '', $mapping);
        $kind = StructureRegisterKind::tryFrom($values['kind']);
        if ($kind === null) {
            return 'Enter a supported register kind.';
        }
        $required = match ($kind) {
            StructureRegisterKind::Programme => ['code', 'name'],
            StructureRegisterKind::Level => ['code', 'name', 'programme_code', 'position'],
            StructureRegisterKind::Specialization => ['code', 'name', 'department_code'],
            StructureRegisterKind::Pathway => ['department_code', 'programme_code', 'specialization_code'],
        };
        foreach ($values as $field => $value) {
            if ($field === 'kind') {
                continue;
            }
            if (in_array($field, $required, true)) {
                if ($value === '' || mb_strlen($value) > 191) {
                    return "Enter $field (maximum 191 characters).";
                }
            } elseif ($value !== '') {
                return "Leave $field blank for this kind.";
            }
        }
        $position = $kind === StructureRegisterKind::Level
            ? filter_var($values['position'], FILTER_VALIDATE_INT, ['options' => ['min_range' => 1, 'max_range' => 2147483647]])
            : null;
        if ($position === false) {
            return 'Enter a whole-number position between 1 and 2147483647.';
        }

        return new self(
            $line,
            $kind,
            $values['code'],
            $values['name'],
            $values['department_code'],
            $values['programme_code'],
            $values['specialization_code'],
            $position,
        );
    }

    public function parentLabel(): string
    {
        return match ($this->kind) {
            StructureRegisterKind::Programme => '',
            StructureRegisterKind::Level => $this->programme,
            StructureRegisterKind::Specialization => $this->department,
            StructureRegisterKind::Pathway => implode(' / ', [$this->department, $this->specialization, $this->programme]),
        };
    }
}
