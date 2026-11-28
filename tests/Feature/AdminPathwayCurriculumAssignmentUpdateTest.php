<?php

namespace Tests\Feature;

use App\Enums\PathwayCurriculumAuditAction;
use App\Models\AuditLog;
use App\Models\CourseOutcome;
use App\Models\CourseRevision;
use App\Models\Curriculum;
use App\Models\CurriculumChoiceGroup;
use App\Models\CurriculumCourse;
use App\Models\Prerequisite;
use App\Models\ProgrammeLevel;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Testing\TestResponse;
use Tests\Support\AcademicAccess;
use Tests\Support\PathwayCurriculumScenario;
use Tests\TestCase;

class AdminPathwayCurriculumAssignmentUpdateTest extends TestCase
{
    use AcademicAccess, PathwayCurriculumScenario, RefreshDatabase;

    public function test_forked_assignment_can_change_content_and_placement_without_detaching_existing_links(): void
    {
        $actor = $this->academicUser('super_admin');
        $source = $this->createVersion();
        $entry = $this->assign($source, ['requirement_mode' => 'choice']);
        $alternative = $this->assign($source, ['requirement_mode' => 'choice']);
        $this->postCurriculum($source, 'choice', [
            'code' => 'Required choice',
            'minimum_selections' => 1,
            'maximum_selections' => 1,
            'curriculum_course_ids' => [$entry->id, $alternative->id],
        ])->assertSessionHasNoErrors();
        $this->postCurriculum($source, 'prerequisite', ['entry_id' => $entry->id, 'required_entry_id' => $alternative->id])
            ->assertSessionHasNoErrors();
        $this->postCurriculum($source, 'course-outcome', ['entry_id' => $entry->id, 'statement' => 'Model systems'])
            ->assertSessionHasNoErrors();
        $this->postCurriculum($source, 'review')->assertSessionHasNoErrors();
        $this->postCurriculum($source, 'approve')->assertSessionHasNoErrors();
        $this->postCurriculum($source, 'fork')->assertSessionHasNoErrors();
        $draft = Curriculum::where('academic_pathway_id', $source->academic_pathway_id)->where('version', 2)->sole();
        $copy = CurriculumCourse::where('curriculum_id', $draft->id)->where('course_id', $entry->course_id)->sole();
        $other = CurriculumCourse::where('curriculum_id', $draft->id)->where('course_id', $alternative->course_id)->sole();
        $group = CurriculumChoiceGroup::where('curriculum_id', $draft->id)->sole();
        $option = $group->options()->where('curriculum_course_id', $copy->id)->sole();
        $edge = Prerequisite::where('curriculum_course_id', $copy->id)->sole();
        $outcome = CourseOutcome::where('curriculum_course_id', $copy->id)->sole();

        $revision = CourseRevision::factory()->approved()->for($entry->course)->create(['revision_number' => 2]);
        $level = ProgrammeLevel::factory()->create([
            'academic_programme_id' => $draft->academic_programme_id,
            'code' => '200',
            'label' => 'Year two',
            'position' => 2,
        ]);
        $changes = [
            'course_revision_id' => $revision->id,
            'programme_level_id' => $level->id,
            'semester_position' => 2,
            'credits' => '10.12345678',
            'category' => 'general_studies',
            'requirement_mode' => 'choice',
        ];
        $this->patchAssignment($draft, $copy, $changes)->assertSessionHasNoErrors()
            ->assertRedirect(route('admin.academic-core', ['curriculum' => $draft->id]));

        $this->assertDatabaseHas('curriculum_courses', ['id' => $copy->id, 'course_id' => $entry->course_id] + $changes);
        $this->assertSame($entry->course_revision_id, $entry->fresh()->course_revision_id);
        $this->assertDatabaseHas('curriculum_choice_options', ['id' => $option->id, 'group_id' => $group->id, 'curriculum_course_id' => $copy->id]);
        $this->assertDatabaseHas('prerequisites', ['id' => $edge->id, 'curriculum_course_id' => $copy->id]);
        $this->assertDatabaseHas('course_outcomes', ['id' => $outcome->id, 'curriculum_course_id' => $copy->id]);
        $audit = AuditLog::where('action', PathwayCurriculumAuditAction::AssignmentUpdated->value)->sole();
        $this->assertSame($actor->id, $audit->actor_id);
        $this->assertSame($copy->id, $audit->details['curriculum_course_id']);
        $this->assertSame($entry->course_revision_id, $audit->details['before']['course_revision_id']);
        $this->assertSame('10.12345678', $audit->details['after']['credits']);

        $this->postCurriculum($draft, 'review')->assertSessionHasErrors('status');
        $this->patchAssignment($draft, $other, ['course_revision_id' => $other->course_revision_id] + $changes)
            ->assertSessionHasNoErrors();
        $this->postCurriculum($draft, 'review')->assertSessionHasNoErrors();
        $this->patchAssignment($draft, $copy, $changes)->assertSessionHasErrors('status');
    }

    public function test_patch_rejects_foreign_entries_unapproved_revisions_and_requirement_mode_changes(): void
    {
        $this->academicUser();
        $version = $this->createVersion();
        $entry = $this->assign($version);
        $otherVersion = $this->createVersion();
        $outside = $this->assign($otherVersion);
        $data = $this->assignmentData($version, ['course_revision_id' => $entry->course_revision_id]);
        $draftRevision = CourseRevision::factory()->for($entry->course)->create(['revision_number' => 2]);
        $otherCourse = $this->revisionFor($version);
        $wrongLevel = ProgrammeLevel::factory()->create();

        $this->patchAssignment($version, $outside, $data)->assertNotFound();
        $this->patchAssignment($version, $entry, ['course_revision_id' => $draftRevision->id] + $data)
            ->assertSessionHasErrors('course_revision_id');
        $this->patchAssignment($version, $entry, ['course_revision_id' => $otherCourse->id] + $data)
            ->assertSessionHasErrors('course_revision_id');
        $this->patchAssignment($version, $entry, ['programme_level_id' => $wrongLevel->id] + $data)
            ->assertSessionHasErrors('programme_level_id');
        $this->patchAssignment($version, $entry, ['requirement_mode' => 'choice'] + $data)
            ->assertSessionHasErrors('requirement_mode');
        $this->academicUser('quality_assurance_officer');
        $this->patchAssignment($version, $entry, $data)->assertForbidden();

        $this->assertSame($entry->getAttributes(), $entry->fresh()->getAttributes());
        $this->assertDatabaseMissing('audit_logs', ['action' => PathwayCurriculumAuditAction::AssignmentUpdated->value]);
    }

    private function patchAssignment(Curriculum $version, CurriculumCourse $entry, array $data): TestResponse
    {
        return $this->patch("/admin/academic-core/curricula/$version->id/assignments/$entry->id", $data);
    }
}
