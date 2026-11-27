<?php

namespace App\Services\Academics;

use App\Enums\StructureRegisterKind;
use App\Models\AcademicPathway;
use App\Models\AcademicProgramme;
use App\Models\Department;
use App\Models\DomainModel;
use App\Models\ProgrammeLevel;
use App\Models\Specialization;
use Illuminate\Support\Facades\DB;

final class StructureRegisterImportLookup
{
    private array $records = [];

    private array $dependencies = [];

    private array $codeKeys = [];

    public function __construct(private StructureImportCodeEquivalence $equivalence, private bool $lock) {}

    /** @param list<StructureRegisterImportRow> $rows */
    public function prime(array $rows): void
    {
        $departments = [];
        $programmes = [];
        $specializations = [];
        foreach ($rows as $row) {
            if ($row->department !== '') {
                $departments[] = $row->department;
                $code = $row->kind === StructureRegisterKind::Specialization ? $row->code : $row->specialization;
                $specializations[$row->department][] = $code;
            }
            if ($row->kind === StructureRegisterKind::Programme || $row->programme !== '') {
                $programmes[] = $row->kind === StructureRegisterKind::Programme ? $row->code : $row->programme;
            }
        }

        // Lock parent tables first, in particular Department before Specialization as in the manual writer.
        foreach ($this->orderedCodes($departments) as $code) {
            $this->find(Department::class, ['code' => $code]);
        }
        foreach ($this->orderedCodes($programmes) as $code) {
            $this->find(AcademicProgramme::class, ['code' => $code]);
        }
        ksort($specializations, SORT_STRING);
        foreach ($specializations as $department => $codes) {
            $record = $this->exact(Department::class, ['code' => (string) $department]);
            if ($record === null) {
                continue;
            }
            foreach ($this->orderedCodes($codes) as $code) {
                $this->find(Specialization::class, ['department_id' => $record->id, 'code' => $code]);
            }
        }
    }

    /** @param class-string<DomainModel> $model */
    public function exact(string $model, array $key): ?DomainModel
    {
        $record = $this->find($model, $key);

        return $record?->code === $key['code'] ? $record : null;
    }

    /** @param class-string<DomainModel> $model */
    public function find(string $model, array $key): ?DomainModel
    {
        // Integer references are source rows for parents that only exist in this batch.
        if (array_any($key, fn (string|int $value): bool => is_int($value))) {
            return null;
        }
        $identity = json_encode($key, JSON_THROW_ON_ERROR);
        if (! array_key_exists($identity, $this->records[$model] ?? [])) {
            $query = $model::query()->where($key);
            if ($this->lock) {
                // PostgreSQL's FK checks use KEY SHARE; permit those while preventing corrections or deletion.
                if (DB::connection()->getDriverName() === 'pgsql') {
                    $query->lock('for no key update');
                } else {
                    $query->lockForUpdate();
                }
            }
            $record = $query->first();
            if ($record !== null) {
                $this->dependencies[$model][$record->id] = $record->getRawOriginal();
            }
            $this->records[$model][$identity] = $record;
        }

        return $this->records[$model][$identity];
    }

    /** @param class-string<DomainModel> $model */
    public function naturalKey(string $model, array $key): string
    {
        if (isset($key['code'])) {
            $code = $key['code'];
            $table = (new $model)->getTable();
            $key['code'] = $this->codeKeys[$table][$code] ??= $this->equivalence->keyForTable($table, $code);
        }

        return json_encode($key, JSON_THROW_ON_ERROR);
    }

    public function dependencies(): array
    {
        return $this->dependencies;
    }

    /** @return class-string<DomainModel> */
    public static function model(StructureRegisterKind $kind): string
    {
        return match ($kind) {
            StructureRegisterKind::Programme => AcademicProgramme::class,
            StructureRegisterKind::Level => ProgrammeLevel::class,
            StructureRegisterKind::Specialization => Specialization::class,
            StructureRegisterKind::Pathway => AcademicPathway::class,
        };
    }

    /** @return list<string> */
    private function orderedCodes(array $codes): array
    {
        $codes = array_unique($codes);
        sort($codes, SORT_STRING);

        return $codes;
    }
}
