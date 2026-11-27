<?php

namespace App\Services\Academics;

use App\Enums\CurriculumStatus;
use App\Models\AcademicLevel;
use App\Models\AcademicSession;
use App\Models\AuditLog;
use App\Models\Course;
use App\Models\Curriculum;
use App\Models\Department;
use App\Models\DomainModel;
use App\Models\Faculty;
use App\Models\Offering;
use App\Models\Programme;
use App\Models\Semester;
use App\Models\StudentSession;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

final class HierarchyChanges
{
    public const array KINDS = ['faculties', 'departments', 'programmes', 'levels', 'sessions', 'semesters'];

    public function create(string $kind, array $data): void
    {
        unset($data['id']);
        $this->model($kind)->forceFill($data)->save();
    }

    public function update(string $actor, string $kind, string $record, array $data): void
    {
        DB::transaction(function () use ($actor, $kind, $record, $data): void {
            $model = $this->model($kind)->newQuery()
                ->whereKey($record)
                ->lockForUpdate()
                ->firstOrFail();
            $before = $model->getRawOriginal();
            $this->assertCanMove($model, $before, $data);
            $model->forceFill($data)->save();
            AuditLog::forceCreate([
                'actor_id' => $actor,
                'subject_key' => $model->getTable().':'.$record,
                'action' => 'organisation.corrected',
                'occurred_at' => now(),
                'details' => ['before' => array_intersect_key($before, $data), 'after' => $data],
            ]);
        });
    }

    public function deleteDepartment(Department $department): void
    {
        try {
            DB::transaction(function () use ($department): void {
                $department->delete();
            });
        } catch (QueryException $error) {
            if (! str_starts_with((string) $error->getCode(), '23')) {
                throw $error;
            }

            throw ValidationException::withMessages(['department' => 'This department is referenced by other records.']);
        }
    }

    private function assertCanMove(DomainModel $model, array $before, array $data): void
    {
        $record = $model->getKey();
        if ($model instanceof Programme && $before['department_id'] !== $data['department_id']
            && (StudentSession::query()->where('programme_id', $record)->exists()
                || Curriculum::query()->where('programme_id', $record)->where('status', CurriculumStatus::Approved->value)->exists())) {
            throw ValidationException::withMessages(['department_id' => 'This programme has recorded history. Create a successor programme for the new department.']);
        }

        if ($model instanceof Department && $before['faculty_id'] !== $data['faculty_id']
            && (Programme::query()->where('department_id', $record)->exists()
                || Course::query()->where('department_id', $record)->exists())) {
            throw ValidationException::withMessages(['faculty_id' => 'This department has linked programmes or courses. Preserve their faculty and create a successor department.']);
        }

        if ($model instanceof Semester && $before['session_id'] !== $data['session_id']
            && Offering::query()->where('semester_id', $record)->exists()) {
            throw ValidationException::withMessages(['session_id' => 'This semester already has offerings. Keep their original academic session.']);
        }
    }

    private function model(string $kind): DomainModel
    {
        return match ($kind) {
            'faculties' => new Faculty,
            'departments' => new Department,
            'programmes' => new Programme,
            'levels' => new AcademicLevel,
            'sessions' => new AcademicSession,
            'semesters' => new Semester,
        };
    }
}
