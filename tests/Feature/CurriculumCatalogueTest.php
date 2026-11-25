<?php

namespace Tests\Feature;

use App\Models\AcademicLevel;
use App\Models\CourseOutcome;
use App\Models\Curriculum;
use App\Models\CurriculumCourse;
use App\Models\Offering;
use App\Models\Programme;
use App\Models\ProgrammeOutcome;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia;
use Tests\Support\AcademicAccess;
use Tests\TestCase;

class CurriculumCatalogueTest extends TestCase
{
    use AcademicAccess, RefreshDatabase;

    public function test_reviewed_approval_immutable_version_and_independent_draft(): void
    {
        $this->academicUser();
        $this->post('/academics/curriculum', [
            'programme_id' => Programme::factory()->create()->id,
            'framework_revision' => 'CCMAS 2023',
        ])->assertSessionHasNoErrors();
        $version = Curriculum::sole();
        $path = '/academics/curriculum/'.$version->id;
        $entry = [
            'code' => 'CS101',
            'title' => 'Foundations',
            'level_id' => AcademicLevel::factory()->create()->id,
            'compulsory' => 1,
            'credits' => '3.5',
            'semester_position' => 1,
            'description' => 'Computer science',
            'outline' => 'Core concepts',
        ];
        $this->post("$path/entry", $entry)->assertSessionHasNoErrors();
        $first = CurriculumCourse::sole();
        $offering = Offering::factory()->create(['curriculum_course_id' => $first->id]);
        $this->post("$path/entry", ['code' => 'CS102'] + $entry)->assertSessionHasNoErrors();
        $second = CurriculumCourse::whereKeyNot($first->id)->sole();
        $this->post("$path/prerequisite", [
            'entry_id' => $second->id,
            'required_entry_id' => $first->id,
        ])->assertSessionHasNoErrors();
        foreach ([$first, $second] as $required) {
            $this->post("$path/prerequisite", [
                'entry_id' => $first->id,
                'required_entry_id' => $required->id,
            ])->assertSessionHasErrors('required_entry_id');
        }

        $this->post("$path/course-outcome", [
            'entry_id' => $first->id,
            'statement' => 'Apply concepts',
        ])->assertSessionHasNoErrors();
        $this->post("$path/programme-outcome", ['statement' => 'Solve problems'])->assertSessionHasNoErrors();
        $mapping = [
            'course_outcome_id' => CourseOutcome::sole()->id,
            'programme_outcome_id' => ProgrammeOutcome::sole()->id,
        ];
        $unrelated = ProgrammeOutcome::forceCreate([
            'curriculum_id' => Curriculum::factory()->create()->id,
            'statement' => 'Other',
        ]);
        $this->post(
            "$path/mapping",
            ['programme_outcome_id' => $unrelated->id] + $mapping,
        )->assertSessionHasErrors('mapping');
        $this->get($path)->assertInertia(
            fn (AssertableInertia $p) => $p
                ->has('courseOutcomes', 1)
                ->has('programmeOutcomes', 1)
                ->has('mappings', 0),
        );
        $this->post("$path/mapping", $mapping)->assertSessionHasNoErrors();
        $this->post("$path/approve")->assertForbidden();
        $this->academicUser('super_admin');
        $this->post("$path/approve")->assertSessionHasErrors('status');
        $this->academicUser();
        $this->post("$path/review")->assertSessionHasNoErrors();
        $actor = $this->academicUser('super_admin');
        $this->post("$path/approve")->assertSessionHasNoErrors();
        $this->assertEquals($actor->id, $version->refresh()->approved_by);
        $this->assertNotNull($version->approved_at);
        $this->academicUser();
        $this->post("$path/entry", $entry)->assertSessionHasErrors('status');
        $this->post("$path/fork")->assertSessionHasNoErrors();
        $draft = Curriculum::where('programme_id', $version->programme_id)->where('version', 2)->sole();
        $this->post(
            "/academics/curriculum/$draft->id/entry",
            ['title' => 'Revised'] + $entry,
        )->assertSessionHasNoErrors();
        $this->assertSame('Foundations', $offering->fresh()->curriculumCourse->title);
        $this->assertDatabaseCount('outcome_mappings', 2);
        $this->assertDatabaseCount('prerequisites', 2);
    }
}
