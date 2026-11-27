<?php

namespace App\Services\Academics;

use App\Enums\PermissionCode;
use App\Models\AcademicLevel;
use App\Models\CourseOutcome;
use App\Models\Curriculum;
use App\Models\CurriculumCourse;
use App\Models\OutcomeMapping;
use App\Models\Prerequisite;
use App\Models\Programme;
use App\Models\ProgrammeOutcome;
use App\Models\User;
use App\Services\Authority\ScopedAuthority;
use Illuminate\Database\Eloquent\Collection;

final class CurriculumCataloguePage
{
    public function __construct(
        private ScopedAuthority $authority,
        private CurriculumCatalogueVersions $versions,
    ) {}

    /**
     * @return array{
     *     edit: bool, approve: bool, version: Curriculum|null, approverName: string|null,
     *     entries: Collection<int, CurriculumCourse>, courseOutcomes: Collection<int, CourseOutcome>,
     *     programmeOutcomes: Collection<int, ProgrammeOutcome>, mappings: Collection<int, OutcomeMapping>,
     *     prerequisites: Collection<int, Prerequisite>, programmes: Collection<int, Programme>,
     *     versions: Collection<int, Curriculum>, levels: Collection<int, AcademicLevel>
     * }
     */
    public function read(User $user, ?Curriculum $version): array
    {
        $edit = $this->authority->institutionAllows($user, PermissionCode::CurriculumEdit);
        $approve = $this->authority->institutionAllows($user, PermissionCode::CurriculumApprove);
        abort_unless($edit || $approve || $this->authority->institutionAllows($user, PermissionCode::ComplianceRead), 403);

        return $this->legacyDetails($version) + [
            'edit' => $edit,
            'approve' => $approve,
            'version' => $version === null ? null : $this->versions->selection($version),
            'approverName' => $version?->approvedBy()->value('full_name'),
            'programmes' => Programme::query()->orderBy('name')->get(['id', 'name']),
            'versions' => $this->versions->listing(),
            'levels' => AcademicLevel::query()->orderBy('label')->get(['id', 'label']),
        ];
    }

    /**
     * @return array{
     *     entries: Collection<int, CurriculumCourse>, courseOutcomes: Collection<int, CourseOutcome>,
     *     programmeOutcomes: Collection<int, ProgrammeOutcome>, mappings: Collection<int, OutcomeMapping>,
     *     prerequisites: Collection<int, Prerequisite>
     * }
     */
    private function legacyDetails(?Curriculum $version): array
    {
        if ($version === null || $version->academic_pathway_id !== null) {
            return [
                'entries' => new Collection,
                'courseOutcomes' => new Collection,
                'programmeOutcomes' => new Collection,
                'mappings' => new Collection,
                'prerequisites' => new Collection,
            ];
        }

        $entries = CurriculumCourse::query()
            ->join('courses', 'courses.id', '=', 'curriculum_courses.course_id')
            ->where('curriculum_courses.curriculum_id', $version->id)
            ->orderBy('courses.code')
            ->get([
                'curriculum_courses.id',
                'curriculum_courses.curriculum_id',
                'curriculum_courses.course_id',
                'curriculum_courses.title',
                'curriculum_courses.description',
                'curriculum_courses.outline',
                'curriculum_courses.credits',
                'curriculum_courses.level_id',
                'curriculum_courses.semester_position',
                'curriculum_courses.compulsory',
                'curriculum_courses.course_revision_id',
                'curriculum_courses.academic_programme_id',
                'curriculum_courses.programme_level_id',
                'curriculum_courses.category',
                'curriculum_courses.requirement_mode',
                'courses.code',
            ]);
        $entryIds = $entries->modelKeys();
        $courseOutcomes = CourseOutcome::query()
            ->whereIn('curriculum_course_id', $entryIds)
            ->get(['id', 'curriculum_course_id', 'statement']);

        return [
            'entries' => $entries,
            'courseOutcomes' => $courseOutcomes,
            'programmeOutcomes' => ProgrammeOutcome::query()
                ->where('curriculum_id', $version->id)
                ->get(['id', 'curriculum_id', 'statement']),
            'mappings' => OutcomeMapping::query()
                ->whereIn('course_outcome_id', $courseOutcomes->modelKeys())
                ->get(['id', 'course_outcome_id', 'programme_outcome_id']),
            'prerequisites' => Prerequisite::query()
                ->whereIn('curriculum_course_id', $entryIds)
                ->get(['id', 'curriculum_course_id', 'required_course_id']),
        ];
    }
}
