<?php

namespace Tests\Support;

use App\Models\AcademicPathway;
use App\Models\Course;
use App\Models\CourseRevision;
use App\Models\Curriculum;
use App\Models\CurriculumCourse;
use App\Models\ProgrammeLevel;
use Illuminate\Testing\TestResponse;

trait PathwayCurriculumScenario
{
    private function createVersion(?AcademicPathway $pathway = null): Curriculum
    {
        $pathway ??= AcademicPathway::factory()->create();
        $this->post(route('admin.academic-core.curricula.store'), [
            'academic_pathway_id' => $pathway->id,
            'framework_revision' => 'Framework 2027',
        ])->assertSessionHasNoErrors()->assertRedirect();

        return Curriculum::where('academic_pathway_id', $pathway->id)->orderByDesc('version')->firstOrFail();
    }

    private function postCurriculum(Curriculum $version, string $action, array $data = []): TestResponse
    {
        return $this->post(route('admin.academic-core.curricula.'.$action, ['curriculum' => $version->id]), $data);
    }

    private function revisionFor(Curriculum $version): CourseRevision
    {
        $course = Course::factory()->create(['department_id' => $version->academicPathway->specialization->department_id]);

        return CourseRevision::factory()->approved()->for($course)->create();
    }

    private function assignmentData(Curriculum $version, array $overrides = []): array
    {
        $level = ProgrammeLevel::where('academic_programme_id', $version->academic_programme_id)->first()
            ?? ProgrammeLevel::factory()->create(['academic_programme_id' => $version->academic_programme_id]);

        return $overrides + [
            'course_revision_id' => $overrides['course_revision_id'] ?? $this->revisionFor($version)->id,
            'programme_level_id' => $level->id,
            'category' => 'core',
            'requirement_mode' => 'individual',
            'credits' => '3.12345678',
            'semester_position' => 1,
        ];
    }

    private function assign(Curriculum $version, array $overrides = []): CurriculumCourse
    {
        $data = $this->assignmentData($version, $overrides);
        $this->postCurriculum($version, 'assignment', $data)
            ->assertSessionHasNoErrors()
            ->assertRedirect(route('admin.academic-core', ['curriculum' => $version->id]));

        return CurriculumCourse::where('curriculum_id', $version->id)->where('course_revision_id', $data['course_revision_id'])->firstOrFail();
    }
}
