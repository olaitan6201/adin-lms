<?php

namespace App\Services\Academics;

use App\Models\CourseOutcome;
use App\Models\CourseRevision;
use App\Models\Curriculum;
use App\Models\CurriculumCourse;
use App\Models\OutcomeMapping;
use App\Models\Prerequisite;
use App\Models\ProgrammeLevel;
use App\Models\ProgrammeOutcome;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;

final class AcademicCoreCurriculumView
{
    public function __construct(
        private AcademicCoreDecisionView $decisions,
        private AcademicCoreVersionHistory $history,
    ) {}

    public function read(?string $id): ?array
    {
        if ($id === null) {
            return null;
        }

        $version = Curriculum::query()->whereNotNull('academic_pathway_id')
            ->with(['academicPathway.programme', 'academicPathway.specialization.department'])
            ->findOrFail(strtolower($id));
        $entries = $this->entries($version->id);
        $entryIds = $entries->modelKeys();
        $courseOutcomes = CourseOutcome::query()->whereIn('curriculum_course_id', $entryIds)
            ->orderBy('id')->get(['id', 'statement', 'curriculum_course_id']);
        $programmeOutcomes = ProgrammeOutcome::query()->where('curriculum_id', $version->id)
            ->orderBy('id')->get(['id', 'statement']);

        return [
            'version' => $version,
            'levels' => ProgrammeLevel::query()->where('academic_programme_id', $version->academic_programme_id)
                ->orderBy('position')->orderBy('code')->get(['id', 'code', 'label']),
            'revisions' => CourseRevision::eligibleForDepartment($version->academicPathway->specialization->department_id)
                ->join('courses', 'courses.id', '=', 'course_revisions.course_id')
                ->orderBy('courses.code')->orderByDesc('course_revisions.revision_number')
                ->get(['course_revisions.id', 'course_revisions.course_id', 'course_revisions.title', 'course_revisions.revision_number', 'courses.code']),
            'entries' => $entries,
            'choices' => DB::table('curriculum_choice_groups')->where('curriculum_id', $version->id)
                ->orderBy('code')->get(['id', 'code', 'minimum_selections', 'maximum_selections']),
            'options' => DB::table('curriculum_choice_options as options')
                ->join('curriculum_courses as entries', 'entries.id', '=', 'options.curriculum_course_id')
                ->join('courses', 'courses.id', '=', 'entries.course_id')
                ->where('options.curriculum_id', $version->id)->orderBy('options.id')
                ->get(['options.group_id', 'options.curriculum_course_id', 'courses.code'])->groupBy('group_id'),
            'courseOutcomes' => $courseOutcomes,
            'programmeOutcomes' => $programmeOutcomes,
            'prerequisites' => Prerequisite::query()->whereIn('curriculum_course_id', $entryIds)
                ->orderBy('id')->get(['curriculum_course_id', 'required_course_id']),
            'mappings' => OutcomeMapping::query()
                ->whereIn('course_outcome_id', $courseOutcomes->modelKeys())
                ->whereIn('programme_outcome_id', $programmeOutcomes->modelKeys())
                ->orderBy('id')->get(['course_outcome_id', 'programme_outcome_id']),
            'adoptions' => $this->decisions->forPathway($version->academic_pathway_id),
            'history' => $this->history->read($version),
        ];
    }

    private function entries(string $version): Collection
    {
        return CurriculumCourse::query()
            ->join('courses', 'courses.id', '=', 'curriculum_courses.course_id')
            ->join('course_revisions as revisions', 'revisions.id', '=', 'curriculum_courses.course_revision_id')
            ->join('programme_levels as levels', 'levels.id', '=', 'curriculum_courses.programme_level_id')
            ->where('curriculum_courses.curriculum_id', $version)
            ->orderBy('levels.position')->orderBy('curriculum_courses.semester_position')->orderBy('courses.code')
            ->get([
                'curriculum_courses.id', 'curriculum_courses.course_id', 'courses.code', 'revisions.title',
                'curriculum_courses.course_revision_id', 'curriculum_courses.programme_level_id',
                'levels.label as level', 'curriculum_courses.credits', 'curriculum_courses.semester_position',
                'curriculum_courses.category', 'curriculum_courses.requirement_mode',
            ]);
    }
}
