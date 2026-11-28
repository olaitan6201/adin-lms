<?php

namespace Tests\Feature;

use App\Enums\PathwayCurriculumAuditAction;
use App\Models\AuditLog;
use App\Models\CourseOutcome;
use App\Models\CurriculumChoiceGroup;
use App\Models\CurriculumCourse;
use App\Models\ProgrammeOutcome;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia;
use Tests\Support\AcademicAccess;
use Tests\Support\PathwayCurriculumScenario;
use Tests\TestCase;

final class AcademicCoreProjectionIntegrityTest extends TestCase
{
    use AcademicAccess, PathwayCurriculumScenario, RefreshDatabase;

    public function test_retained_legacy_choice_options_remain_visible_without_masquerading_as_valid_assignments(): void
    {
        $this->academicUser();
        $version = $this->createVersion();
        $assigned = $this->assign($version, ['requirement_mode' => 'choice']);
        $legacy = CurriculumCourse::factory()->create(['curriculum_id' => $version->id]);
        $group = CurriculumChoiceGroup::create([
            'curriculum_id' => $version->id,
            'code' => 'HISTORICAL',
            'minimum_selections' => 1,
            'maximum_selections' => 1,
        ]);
        foreach ([$assigned, $legacy] as $entry) {
            $group->options()->create(['curriculum_id' => $version->id, 'curriculum_course_id' => $entry->id]);
        }

        $this->get(route('admin.academic-core', ['curriculum' => $version->id]))->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->has('curriculum.entries', 1)
                ->where('curriculum.entries.0.id', $assigned->id)
                ->where('curriculum.choices.0.unresolvedOptions', 1)
                ->where('curriculum.choices.0.options', [$assigned->course->code, $legacy->course->code.' (retained, not a pathway assignment)'])
                ->etc());
        $this->assertDatabaseCount('curriculum_choice_options', 2);
        $this->postCurriculum($version, 'review')->assertSessionHasErrors('status');
    }

    public function test_assignable_revisions_require_the_same_approval_evidence_as_the_writer(): void
    {
        $this->academicUser();
        $version = $this->createVersion();
        $unverified = $this->revisionFor($version);
        $unverified->forceFill(['approved_by' => null, 'approved_at' => null])->save();
        $approved = $this->revisionFor($version);

        $this->get(route('admin.academic-core', ['curriculum' => $version->id]))->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->has('curriculum.revisions', 1)
                ->where('curriculum.revisions.0.id', $approved->id)
                ->etc());
        $this->postCurriculum($version, 'assignment', $this->assignmentData($version, ['course_revision_id' => $unverified->id]))
            ->assertSessionHasErrors('course_revision_id');
        $this->assign($version, ['course_revision_id' => $approved->id]);
    }

    public function test_replayed_graph_links_do_not_manufacture_fork_changes(): void
    {
        $this->academicUser('super_admin');
        $source = $this->createVersion();
        $this->assign($source);
        $this->assign($source);
        $this->postCurriculum($source, 'review')->assertSessionHasNoErrors();
        $this->postCurriculum($source, 'approve')->assertSessionHasNoErrors();
        $this->postCurriculum($source, 'fork')->assertSessionHasNoErrors();
        $draft = $source->query()->where('academic_pathway_id', $source->academic_pathway_id)->where('version', 2)->sole();
        [$entry, $required] = CurriculumCourse::where('curriculum_id', $draft->id)->orderBy('id')->get()->all();
        $course = CourseOutcome::forceCreate(['curriculum_course_id' => $entry->id, 'statement' => 'Course objective']);
        $programme = ProgrammeOutcome::forceCreate(['curriculum_id' => $draft->id, 'statement' => 'Programme objective']);

        foreach ([
            'mapping' => ['course_outcome_id' => $course->id, 'programme_outcome_id' => $programme->id],
            'prerequisite' => ['entry_id' => $entry->id, 'required_entry_id' => $required->id],
        ] as $action => $payload) {
            $this->postCurriculum($draft, $action, $payload)->assertSessionHasNoErrors()->assertRedirect();
            $this->postCurriculum($draft, $action, $payload)->assertSessionHasNoErrors()->assertRedirect();
        }

        $this->assertDatabaseCount('outcome_mappings', 1);
        $this->assertDatabaseCount('prerequisites', 1);
        foreach ([PathwayCurriculumAuditAction::OutcomeMapped, PathwayCurriculumAuditAction::PrerequisiteAdded] as $action) {
            $this->assertSame(1, AuditLog::where('subject_key', 'curricula:'.$draft->id)->where('action', $action->value)->count());
        }

        $this->get(route('admin.academic-core', ['curriculum' => $draft->id]))->assertInertia(
            fn (AssertableInertia $page) => $page->has('curriculum.history.changes', 2)->etc(),
        );
    }
}
