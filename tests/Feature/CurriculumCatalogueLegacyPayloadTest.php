<?php

namespace Tests\Feature;

use App\Enums\CurriculumStatus;
use App\Models\AcademicLevel;
use App\Models\Course;
use App\Models\CourseOutcome;
use App\Models\Curriculum;
use App\Models\CurriculumCourse;
use App\Models\OutcomeMapping;
use App\Models\Prerequisite;
use App\Models\Programme;
use App\Models\ProgrammeOutcome;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Inertia\Testing\AssertableInertia;
use Tests\Support\AcademicAccess;
use Tests\TestCase;

class CurriculumCatalogueLegacyPayloadTest extends TestCase
{
    use AcademicAccess, RefreshDatabase;

    public function test_legacy_selection_preserves_exact_fields_raw_values_and_ordering(): void
    {
        $this->academicUser('quality_assurance_officer');
        $approver = User::factory()->create(['full_name' => 'Catalogue Approver']);
        $programme = Programme::factory()->create(['name' => 'Zoology']);
        $otherProgramme = Programme::factory()->create(['name' => 'Accounting']);
        $version = Curriculum::factory()->for($programme)->create([
            'status' => CurriculumStatus::Approved,
            'approved_by' => $approver->id,
            'approved_at' => '2026-11-01 09:30:00+00:00',
        ]);
        $otherVersion = Curriculum::factory()->for($otherProgramme)->create();
        $advanced = AcademicLevel::factory()->create(['label' => 'Second Year']);
        $introductory = AcademicLevel::factory()->create(['label' => 'First Year']);
        $laterCourse = Course::factory()->create(['code' => 'ZOO200']);
        $earlierCourse = Course::factory()->create(['code' => 'ZOO100']);
        $later = $this->entry($version, $laterCourse, $advanced);
        $earlier = $this->entry($version, $earlierCourse, $introductory);
        $otherEntry = $this->entry($otherVersion, $earlierCourse, $introductory);
        $courseOutcome = CourseOutcome::forceCreate([
            'curriculum_course_id' => $earlier->id,
            'statement' => 'Classify specimens',
        ]);
        $otherCourseOutcome = CourseOutcome::forceCreate([
            'curriculum_course_id' => $otherEntry->id,
            'statement' => 'Outside this version',
        ]);
        $programmeOutcome = ProgrammeOutcome::forceCreate([
            'curriculum_id' => $version->id,
            'statement' => 'Apply taxonomy',
        ]);
        $otherProgrammeOutcome = ProgrammeOutcome::forceCreate([
            'curriculum_id' => $otherVersion->id,
            'statement' => 'Outside this version',
        ]);
        $mapping = OutcomeMapping::forceCreate([
            'course_outcome_id' => $courseOutcome->id,
            'programme_outcome_id' => $programmeOutcome->id,
        ]);
        $prerequisite = Prerequisite::forceCreate([
            'curriculum_course_id' => $earlier->id,
            'required_course_id' => $laterCourse->id,
        ]);
        OutcomeMapping::forceCreate([
            'course_outcome_id' => $otherCourseOutcome->id,
            'programme_outcome_id' => $otherProgrammeOutcome->id,
        ]);
        Prerequisite::forceCreate(['curriculum_course_id' => $otherEntry->id, 'required_course_id' => $laterCourse->id]);

        $this->get(route('academics.curriculum.show', $version))
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->component('Academics/Catalogue')
                ->where('edit', false)
                ->where('approve', false)
                ->where('approverName', 'Catalogue Approver')
                ->where('entries', [
                    $this->entryPayload($earlier, 'ZOO100'),
                    $this->entryPayload($later, 'ZOO200'),
                ])
                ->where('courseOutcomes', [[
                    'id' => $courseOutcome->id,
                    'curriculum_course_id' => $earlier->id,
                    'statement' => 'Classify specimens',
                ]])
                ->where('programmeOutcomes', [[
                    'id' => $programmeOutcome->id,
                    'curriculum_id' => $version->id,
                    'statement' => 'Apply taxonomy',
                ]])
                ->where('mappings', [[
                    'id' => $mapping->id,
                    'course_outcome_id' => $courseOutcome->id,
                    'programme_outcome_id' => $programmeOutcome->id,
                ]])
                ->where('prerequisites', [[
                    'id' => $prerequisite->id,
                    'curriculum_course_id' => $earlier->id,
                    'required_course_id' => $laterCourse->id,
                ]])
                ->where('programmes', [
                    ['id' => $otherProgramme->id, 'name' => 'Accounting'],
                    ['id' => $programme->id, 'name' => 'Zoology'],
                ])
                ->where('levels', [
                    ['id' => $introductory->id, 'name' => 'First Year'],
                    ['id' => $advanced->id, 'name' => 'Second Year'],
                ])
                ->etc());
    }

    private function entry(Curriculum $version, Course $course, AcademicLevel $level): CurriculumCourse
    {
        return CurriculumCourse::factory()->for($version)->for($course)->for($level, 'level')->create([
            'title' => 'Taxonomy',
            'description' => 'Classification of animals',
            'outline' => null,
            'credits' => '3.125',
            'semester_position' => 2,
            'compulsory' => false,
        ]);
    }

    private function entryPayload(CurriculumCourse $entry, string $code): array
    {
        return [
            'id' => $entry->id,
            'curriculum_id' => $entry->curriculum_id,
            'course_id' => $entry->course_id,
            'title' => 'Taxonomy',
            'description' => 'Classification of animals',
            'outline' => null,
            'credits' => DB::getDriverName() === 'sqlite' ? 3.125 : '3.12500000',
            'level_id' => $entry->level_id,
            'semester_position' => 2,
            'compulsory' => DB::getDriverName() === 'pgsql' ? false : 0,
            'course_revision_id' => null,
            'academic_programme_id' => null,
            'programme_level_id' => null,
            'category' => null,
            'requirement_mode' => null,
            'code' => $code,
        ];
    }
}
