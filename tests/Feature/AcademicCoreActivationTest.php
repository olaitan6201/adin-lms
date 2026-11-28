<?php

namespace Tests\Feature;

use App\Enums\CurriculumStatus;
use App\Enums\PathwayCurriculumAuditAction;
use App\Models\AcademicPathway;
use App\Models\AcademicSession;
use App\Models\AuditLog;
use App\Models\Course;
use App\Models\Curriculum;
use App\Models\CurriculumCourse;
use App\Models\ProgrammeLevel;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Inertia\Testing\AssertableInertia;
use Tests\Support\AcademicAccess;
use Tests\TestCase;

final class AcademicCoreActivationTest extends TestCase
{
    use AcademicAccess, RefreshDatabase;

    public function test_new_course_curriculum_and_adoption_require_no_legacy_placeholders(): void
    {
        $actor = $this->academicUser('super_admin');
        $pathway = AcademicPathway::factory()->create();
        $level = ProgrammeLevel::factory()->for($pathway->programme, 'programme')->create();
        $department = $pathway->specialization->department_id;
        $first = $this->approveRevision($department, 'CORE-101', 'Applied reasoning');
        $second = $this->approveRevision($department, 'CORE-102', 'Systems practice');

        $this->submit('curricula.store', [
            'academic_pathway_id' => $pathway->id,
            'framework_revision' => 'Framework 2030',
        ]);
        $version = Curriculum::where('academic_pathway_id', $pathway->id)->sole();
        $this->assertNull($version->programme_id);
        $this->assign($version, $first, $level);
        $this->assign($version, $second, $level);
        $entries = CurriculumCourse::where('curriculum_id', $version->id)->pluck('id');
        $this->assertDatabaseHas('curriculum_courses', [
            'curriculum_id' => $version->id,
            'course_revision_id' => $first,
            'programme_level_id' => $level->id,
            'level_id' => null,
        ]);
        $this->submit('curricula.choice', [
            'code' => 'WAYS',
            'minimum_selections' => 1,
            'maximum_selections' => 1,
            'curriculum_course_ids' => $entries->all(),
        ], [$version]);
        $this->post(route('academics.curriculum.change', [$version, 'review']))->assertSessionHasErrors('status');
        $this->submit('curricula.review', [], [$version]);
        $this->submit('curricula.approve', [], [$version]);
        $this->assertSame(CurriculumStatus::Approved, $version->fresh()->status);
        $audit = AuditLog::where('subject_key', 'curricula:'.$version->id)
            ->where('action', PathwayCurriculumAuditAction::Approved->value)->sole();
        $this->assertSame(PathwayCurriculumAuditAction::Approved, $audit->pathway_curriculum_action);
        $this->assertSame($actor->id, $audit->actor_id);

        $this->submit('cohorts.store', ['code' => '2030-A', 'label' => '2030 entrants']);
        $session = AcademicSession::factory()->create();
        $this->submit('adoptions.store', [
            'curriculum_id' => $version->id,
            'academic_session_id' => $session->id,
            'entry_cohort_id' => DB::table('entry_cohorts')->sole()->id,
            'decision_reference' => 'BOARD-2030-1',
            'reason' => 'Approved use for the 2030 intake.',
        ]);

        $decision = DB::table('curriculum_adoption_decisions')->sole();
        $this->assertSame($actor->id, $decision->approved_by);
        $this->assertSame($decision->id, DB::table('curriculum_adoptions')->sole()->active_decision_id);
        $this->assertDatabaseCount('student_sessions', 0);
        $this->assertDatabaseCount('enrolments', 0);
        $this->get(route('admin.academic-core', ['curriculum' => $version->id]))
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->where('curriculum.entries.0.title', 'Applied reasoning')
                ->where('curriculum.entries.0.level', $level->label)
                ->where('curriculum.choices.0.maximum_selections', 1)
                ->where('curriculum.adoptions.0.active', true)
                ->etc());
    }

    private function approveRevision(string $department, string $code, string $title): string
    {
        $this->submit('courses.store', ['department_id' => $department, 'code' => $code]);
        $course = Course::where('code', $code)->sole();
        $this->submit('revisions.store', [
            'title' => $title,
            'description' => 'Course content and requirements.',
            'standard_units' => '3.25000000',
        ], [$course]);
        $revision = DB::table('course_revisions')->where('course_id', $course->id)->sole();
        $this->submit('revisions.review', [], [$revision->id]);
        $this->submit('revisions.approve', [], [$revision->id]);

        return $revision->id;
    }

    private function assign(Curriculum $version, string $revision, ProgrammeLevel $level): void
    {
        $this->submit('curricula.assignment', [
            'course_revision_id' => $revision,
            'programme_level_id' => $level->id,
            'category' => 'core',
            'requirement_mode' => 'choice',
            'credits' => '3.25000000',
            'semester_position' => 1,
        ], [$version]);
    }

    private function submit(string $action, array $payload, array $parameters = []): void
    {
        $this->post(route("admin.academic-core.$action", $parameters), $payload)
            ->assertRedirect()
            ->assertSessionHasNoErrors();
    }
}
