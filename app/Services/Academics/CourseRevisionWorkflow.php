<?php

namespace App\Services\Academics;

use App\Enums\CourseCatalogueEvent;
use App\Enums\CurriculumStatus;
use App\Enums\PermissionCode;
use App\Models\Course;
use App\Models\CourseRevision;
use App\Models\Department;
use App\Models\User;
use App\Services\Authority\ScopedAuthority;
use Brick\Math\BigDecimal;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

final class CourseRevisionWorkflow
{
    public function __construct(
        private ScopedAuthority $authority,
        private AcademicCoreAudit $audit,
    ) {}

    public function createCourse(User $actor, string $department, string $code): Course
    {
        $this->authorize($actor, PermissionCode::CurriculumEdit);

        return DB::transaction(function () use ($actor, $department, $code): Course {
            Department::query()->sharedLock()->findOrFail($department);
            try {
                $course = Course::forceCreate(['department_id' => $department, 'code' => $code]);
            } catch (UniqueConstraintViolationException) {
                throw ValidationException::withMessages(['code' => 'This course code is already in use.']);
            }

            $this->audit->record($actor, $course, CourseCatalogueEvent::CourseCreated, [
                'department_id' => $course->department_id,
                'code' => $course->code,
            ]);

            return $course;
        }, 3);
    }

    /** @param array{title:string,description:string,syllabus?:?string,learning_outcomes?:?string,standard_units:string} $content */
    public function draft(User $actor, Course $course, array $content): CourseRevision
    {
        $this->authorize($actor, PermissionCode::CurriculumEdit);

        return DB::transaction(function () use ($actor, $course, $content): CourseRevision {
            $course = Course::query()->lockForUpdate()->findOrFail($course->id);
            $lastNumber = CourseRevision::query()->where('course_id', $course->id)
                ->orderByDesc('revision_number')->lockForUpdate()->value('revision_number');
            $revision = new CourseRevision;
            $revision->course()->associate($course);
            $revision->revision_number = 1 + (int) $lastNumber;
            $revision->status = CurriculumStatus::Draft;
            $this->persistContent($revision, $content);
            $this->auditRevision($actor, $revision, CourseCatalogueEvent::RevisionDrafted);

            return $revision;
        }, 3);
    }

    /** @param array{title:string,description:string,syllabus?:?string,learning_outcomes?:?string,standard_units:string} $content */
    public function update(User $actor, CourseRevision $revision, array $content): void
    {
        $this->authorize($actor, PermissionCode::CurriculumEdit);

        DB::transaction(function () use ($actor, $revision, $content): void {
            $revision = $this->lockInState($revision, CurriculumStatus::Draft);
            $this->persistContent($revision, $content);
            $this->auditRevision($actor, $revision, CourseCatalogueEvent::RevisionUpdated);
        }, 3);
    }

    public function review(User $actor, CourseRevision $revision): void
    {
        $this->authorize($actor, PermissionCode::CurriculumEdit);

        DB::transaction(function () use ($actor, $revision): void {
            $revision = $this->lockInState($revision, CurriculumStatus::Draft);
            $revision->status = CurriculumStatus::Reviewed;
            $revision->save();
            $this->auditRevision($actor, $revision, CourseCatalogueEvent::RevisionReviewed);
        }, 3);
    }

    public function approve(User $actor, CourseRevision $revision): void
    {
        $this->authorize($actor, PermissionCode::CurriculumApprove);

        DB::transaction(function () use ($actor, $revision): void {
            $revision = $this->lockInState($revision, CurriculumStatus::Reviewed);
            $revision->status = CurriculumStatus::Approved;
            $revision->approvedBy()->associate($actor);
            $revision->approved_at = now();
            $revision->save();
            $this->auditRevision($actor, $revision, CourseCatalogueEvent::RevisionApproved);
        }, 3);
    }

    private function authorize(User $actor, PermissionCode $permission): void
    {
        if (! $this->authority->institutionAllows($actor, $permission)) {
            throw new AuthorizationException;
        }
    }

    private function lockInState(CourseRevision $revision, CurriculumStatus $status): CourseRevision
    {
        $revision = CourseRevision::query()->lockForUpdate()->findOrFail($revision->id);
        if ($revision->status !== $status) {
            throw ValidationException::withMessages(['status' => "This action requires a {$status->value} revision."]);
        }

        return $revision;
    }

    /** @param array{title:string,description:string,syllabus?:?string,learning_outcomes?:?string,standard_units:string} $content */
    private function persistContent(CourseRevision $revision, array $content): void
    {
        $units = $content['standard_units'];
        $revision->fill($content)->save();

        // SQLite's numeric affinity can round decimal strings. Refuse any inexact write before commit.
        if (! BigDecimal::of((string) $revision->refresh()->getRawOriginal('standard_units'))->isEqualTo($units)) {
            throw ValidationException::withMessages(['standard_units' => 'This database cannot store these units exactly.']);
        }
    }

    private function auditRevision(User $actor, CourseRevision $revision, CourseCatalogueEvent $event): void
    {
        $this->audit->record($actor, $revision, $event, [
            'course_id' => $revision->course_id,
            'revision_number' => $revision->revision_number,
            'status' => $revision->status->value,
        ]);
    }
}
