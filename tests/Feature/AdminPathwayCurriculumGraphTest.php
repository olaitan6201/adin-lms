<?php

namespace Tests\Feature;

use App\Enums\CurriculumStatus;
use App\Enums\PathwayCurriculumAuditAction;
use App\Models\CourseOutcome;
use App\Models\Curriculum;
use App\Models\CurriculumChoiceGroup;
use App\Models\CurriculumCourse;
use App\Models\Prerequisite;
use App\Models\ProgrammeOutcome;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Support\AcademicAccess;
use Tests\Support\PathwayCurriculumScenario;
use Tests\TestCase;

class AdminPathwayCurriculumGraphTest extends TestCase
{
    use AcademicAccess, PathwayCurriculumScenario, RefreshDatabase;

    public function test_prerequisites_and_mapping_reject_cross_version_references_and_cycles(): void
    {
        $this->academicUser('super_admin');
        $version = $this->createVersion();
        $foreign = $this->createVersion();
        $entry = $this->assign($version);
        $required = $this->assign($version);
        $outside = $this->assign($foreign);

        $this->postCurriculum($version, 'prerequisite', ['entry_id' => $entry->id, 'required_entry_id' => $outside->id])
            ->assertNotFound();
        $this->postCurriculum($version, 'prerequisite', ['entry_id' => $entry->id, 'required_entry_id' => $required->id])
            ->assertSessionHasNoErrors();
        $this->postCurriculum($version, 'prerequisite', ['entry_id' => $required->id, 'required_entry_id' => $entry->id])
            ->assertSessionHasErrors('required_entry_id');
        $this->assertDatabaseCount('prerequisites', 1);

        $this->postCurriculum($version, 'course-outcome', ['entry_id' => $outside->id, 'statement' => 'Not this version'])
            ->assertNotFound();
        $this->postCurriculum($version, 'course-outcome', ['entry_id' => $entry->id, 'statement' => 'Apply concepts'])
            ->assertSessionHasNoErrors();
        $this->postCurriculum($foreign, 'programme-outcome', ['statement' => 'Solve problems'])
            ->assertSessionHasNoErrors();
        $this->postCurriculum($version, 'mapping', [
            'course_outcome_id' => CourseOutcome::sole()->id,
            'programme_outcome_id' => ProgrammeOutcome::sole()->id,
        ])->assertSessionHasErrors('mapping');
        $this->assertDatabaseCount('outcome_mappings', 0);

        Prerequisite::forceCreate(['curriculum_course_id' => $entry->id, 'required_course_id' => $outside->course_id]);
        $this->postCurriculum($version, 'review')->assertSessionHasErrors('status');
        $this->assertSame(CurriculumStatus::Draft, $version->refresh()->status);
    }

    public function test_fork_copies_the_graph_without_reusing_version_owned_ids_or_approval(): void
    {
        $actor = $this->academicUser('super_admin');
        $source = $this->createVersion();
        $entry = $this->assign($source, ['requirement_mode' => 'choice']);
        $required = $this->assign($source, ['requirement_mode' => 'choice']);
        $this->postCurriculum($source, 'choice', [
            'code' => 'Alternatives',
            'minimum_selections' => 1,
            'maximum_selections' => 1,
            'curriculum_course_ids' => [$entry->id, $required->id],
        ])->assertSessionHasNoErrors();
        $this->postCurriculum($source, 'prerequisite', ['entry_id' => $entry->id, 'required_entry_id' => $required->id])
            ->assertSessionHasNoErrors();
        $this->postCurriculum($source, 'course-outcome', ['entry_id' => $entry->id, 'statement' => 'Apply concepts'])
            ->assertSessionHasNoErrors();
        $this->postCurriculum($source, 'programme-outcome', ['statement' => 'Solve problems'])
            ->assertSessionHasNoErrors();
        $courseOutcome = CourseOutcome::sole();
        $programmeOutcome = ProgrammeOutcome::sole();
        $this->postCurriculum($source, 'mapping', [
            'course_outcome_id' => $courseOutcome->id,
            'programme_outcome_id' => $programmeOutcome->id,
        ])->assertSessionHasNoErrors();

        $this->postCurriculum($source, 'review')->assertSessionHasNoErrors();
        $this->postCurriculum($source, 'approve')->assertSessionHasNoErrors();
        $approvedAt = $source->refresh()->approved_at;
        $this->postCurriculum($source, 'programme-outcome', ['statement' => 'Not mutable'])->assertSessionHasErrors('status');
        $response = $this->postCurriculum($source, 'fork')->assertSessionHasNoErrors();
        $draft = Curriculum::where('academic_pathway_id', $source->academic_pathway_id)->where('version', 2)->sole();
        $response->assertRedirect(route('admin.academic-core', ['curriculum' => $draft->id]));

        $this->assertSame(CurriculumStatus::Draft, $draft->status);
        $this->assertNull($draft->approved_by);
        $this->assertNull($draft->approved_at);
        $this->assertSame($source->framework_revision, $draft->framework_revision);
        $this->assertEquals($approvedAt, $source->refresh()->approved_at);
        $this->assertSame($actor->id, $source->approved_by);

        $copied = CurriculumCourse::where('curriculum_id', $draft->id)->where('course_id', $entry->course_id)->sole();
        $target = CurriculumCourse::where('curriculum_id', $draft->id)->where('course_id', $required->course_id)->sole();
        $this->assertNotSame($entry->id, $copied->id);
        $this->assertSame($entry->course_revision_id, $copied->course_revision_id);
        $this->assertSame($entry->getRawOriginal('credits'), $copied->getRawOriginal('credits'));
        $this->assertDatabaseHas('prerequisites', ['curriculum_course_id' => $copied->id, 'required_course_id' => $required->course_id]);
        $group = CurriculumChoiceGroup::where('curriculum_id', $draft->id)->sole();
        $this->assertEqualsCanonicalizing([$copied->id, $target->id], $group->options()->pluck('curriculum_course_id')->all());

        $copiedCourseOutcome = CourseOutcome::where('curriculum_course_id', $copied->id)->sole();
        $copiedProgrammeOutcome = ProgrammeOutcome::where('curriculum_id', $draft->id)->sole();
        $this->assertSame($courseOutcome->statement, $copiedCourseOutcome->statement);
        $this->assertSame($programmeOutcome->statement, $copiedProgrammeOutcome->statement);
        $this->assertDatabaseHas('outcome_mappings', [
            'course_outcome_id' => $copiedCourseOutcome->id, 'programme_outcome_id' => $copiedProgrammeOutcome->id,
        ]);
        $this->assertDatabaseHas('outcome_mappings', [
            'course_outcome_id' => $courseOutcome->id, 'programme_outcome_id' => $programmeOutcome->id,
        ]);
        $this->assertDatabaseHas('audit_logs', [
            'actor_id' => $actor->id,
            'action' => PathwayCurriculumAuditAction::Forked->value,
            'subject_key' => 'curricula:'.$draft->id,
        ]);

        $this->postCurriculum($draft, 'programme-outcome', ['statement' => 'Independently edited'])
            ->assertSessionHasNoErrors();
        $this->assertSame(1, ProgrammeOutcome::where('curriculum_id', $source->id)->count());
        $this->postCurriculum($draft, 'review')->assertSessionHasNoErrors();
    }
}
