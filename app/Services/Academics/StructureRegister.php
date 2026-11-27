<?php

namespace App\Services\Academics;

use App\Enums\OrganisationAuditAction;
use App\Enums\StructureRegisterKind;
use App\Models\AcademicPathway;
use App\Models\AcademicProgramme;
use App\Models\AuditLog;
use App\Models\DomainModel;
use App\Models\ProgrammeLevel;
use App\Models\Specialization;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use LogicException;

final class StructureRegister
{
    public function records(): array
    {
        return [
            'programmes' => AcademicProgramme::query()->orderBy('name')->orderBy('code')->get(),
            'levels' => ProgrammeLevel::query()->orderBy('position')->orderBy('code')->orderBy('id')->get(),
            'specializations' => Specialization::query()->orderBy('name')->orderBy('code')->orderBy('id')->get(),
            'pathways' => AcademicPathway::query()->orderBy('id')->get(),
        ];
    }

    public static function revision(DomainModel $record): string
    {
        return hash('sha256', $record->getTable().':'.$record->getKey().':'.$record->getAttribute('revision_number'));
    }

    public function create(StructureRegisterKind $kind, string $actor, array $data): void
    {
        $this->persist($this->candidate($kind, $data), $actor);
    }

    public function correct(StructureRegisterKind $kind, string $actor, string $id, array $data, string $revision): void
    {
        if ($kind === StructureRegisterKind::Pathway) {
            throw new LogicException('Pathways cannot be corrected in place.');
        }

        $this->persist($this->candidate($kind, $data), $actor, strtolower($id), $revision);
    }

    private function persist(DomainModel $candidate, string $actor, ?string $id = null, ?string $revision = null): void
    {
        try {
            DB::transaction(function () use ($candidate, $actor, $id, $revision): void {
                $model = $candidate;
                $attributes = $candidate->getAttributes();
                $before = [];
                if ($id !== null) {
                    $model = $candidate->newQuery()->lockForUpdate()->findOrFail($id);
                    $this->verifyCorrection($model, $attributes, $revision);
                    $before = array_intersect_key($model->attributesToArray(), $attributes);
                    $model->setAttribute('revision_number', $model->getAttribute('revision_number') + 1);
                } elseif ($candidate instanceof Specialization) {
                    $candidate->department()->lockForUpdate()->firstOrFail();
                }

                $model->fill($attributes)->save();
                $after = array_intersect_key($model->refresh()->attributesToArray(), $attributes);
                AuditLog::forceCreate([
                    'actor_id' => $actor,
                    'subject_key' => $model->getTable().':'.$model->getKey(),
                    'action' => $id === null ? OrganisationAuditAction::Created : OrganisationAuditAction::Corrected,
                    'occurred_at' => now(),
                    'details' => ['before' => $before, 'after' => $after],
                ]);
            });
        } catch (UniqueConstraintViolationException) {
            $field = $candidate instanceof AcademicPathway ? 'academic_programme_id' : 'code';
            throw ValidationException::withMessages([$field => 'This value is already in use in the register.']);
        }
    }

    private function verifyCorrection(DomainModel $model, array $attributes, ?string $revision): void
    {
        if ($revision === null || ! hash_equals(self::revision($model), $revision)) {
            throw ValidationException::withMessages(['revision' => 'This record changed while you were editing. Close this form and reopen it to use the latest values.']);
        }

        $parent = match (true) {
            $model instanceof ProgrammeLevel => $model->programme()->getForeignKeyName(),
            $model instanceof Specialization => $model->department()->getForeignKeyName(),
            default => null,
        };
        if ($parent !== null && $model->getAttribute($parent) !== $attributes[$parent]) {
            throw ValidationException::withMessages([$parent => 'The parent cannot change. Create a new record instead.']);
        }
    }

    private function candidate(StructureRegisterKind $kind, array $data): DomainModel
    {
        return match ($kind) {
            StructureRegisterKind::Programme => (new AcademicProgramme)->fill([
                'code' => $data['code'],
                'name' => $data['name'],
            ]),
            StructureRegisterKind::Level => (new ProgrammeLevel)->fill([
                'academic_programme_id' => strtolower($data['academic_programme_id']),
                'code' => $data['code'],
                'label' => $data['label'],
                'position' => (int) $data['position'],
            ]),
            StructureRegisterKind::Specialization => (new Specialization)->fill([
                'department_id' => strtolower($data['department_id']),
                'code' => $data['code'],
                'name' => $data['name'],
            ]),
            StructureRegisterKind::Pathway => (new AcademicPathway)->fill([
                'specialization_id' => strtolower($data['specialization_id']),
                'academic_programme_id' => strtolower($data['academic_programme_id']),
            ]),
        };
    }
}
