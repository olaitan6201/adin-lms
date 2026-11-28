<?php

namespace App\Services\Academics;

use App\Enums\PermissionCode;
use App\Enums\StructureRegisterStatus;
use App\Models\AcademicPathway;
use App\Models\AcademicSession;
use App\Models\Course;
use App\Models\CourseRevision;
use App\Models\Curriculum;
use App\Models\Department;
use App\Models\EntryCohort;
use App\Models\User;
use App\Services\Authority\ScopedAuthority;

final class AcademicCorePage
{
    public function __construct(
        private ScopedAuthority $authority,
        private AcademicCoreCurriculumView $curricula,
    ) {}

    public function read(User $actor, ?string $courseId, ?string $curriculumId): array
    {
        $edit = $this->authority->institutionAllows($actor, PermissionCode::CurriculumEdit);
        $approve = $this->authority->institutionAllows($actor, PermissionCode::CurriculumApprove);
        abort_unless($edit || $approve || $this->authority->institutionAllows($actor, PermissionCode::ComplianceRead), 403);

        return [
            'edit' => $edit,
            'approve' => $approve,
            'structure' => $this->authority->institutionAllows($actor, PermissionCode::AcademicsManage),
            'departments' => Department::query()->orderBy('name')->orderBy('code')->get(['id', 'name', 'code']),
            'courses' => Course::query()->orderBy('code')->get(['id', 'code']),
            'pathways' => AcademicPathway::query()
                ->where('status', StructureRegisterStatus::Active)
                ->with(['programme:id,name,code', 'specialization:id,department_id,name,code', 'specialization.department:id,code'])
                ->orderBy('id')->get(),
            'sessions' => AcademicSession::query()->orderByDesc('starts_on')->orderBy('id')->get(['id', 'label']),
            'cohorts' => EntryCohort::query()->orderBy('code')->orderBy('id')->get(['id', 'code', 'label']),
            'course' => $this->course($courseId),
            'curricula' => Curriculum::query()->whereNotNull('academic_pathway_id')
                ->with(['academicPathway.programme', 'academicPathway.specialization.department'])
                ->orderBy('academic_pathway_id')->orderByDesc('version')->get(),
            'curriculum' => $this->curricula->read($curriculumId),
        ];
    }

    private function course(?string $id): ?array
    {
        if ($id === null) {
            return null;
        }

        $course = Course::query()->findOrFail(strtolower($id), ['id', 'code']);

        return [
            'course' => $course,
            'revisions' => CourseRevision::query()->where('course_id', $course->id)
                ->orderByDesc('revision_number')->get([
                    'id', 'title', 'description', 'syllabus', 'learning_outcomes', 'standard_units', 'revision_number', 'status',
                ]),
        ];
    }
}
