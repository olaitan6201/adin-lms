<?php

namespace Tests\Feature\Insights;

use App\Models\Curriculum;
use App\Models\User;
use App\Services\Authority\ChangeRoleGrant;
use Illuminate\Support\Facades\DB;

final class DashboardWorkspaceTest extends InsightCase
{
    use AssessmentFixture;

    public function test_agenda_excludes_closed_submitted_and_withdrawn_work(): void
    {
        $student = $this->loginAs('ada');
        $course = $this->assessmentFixture($student);
        $this->record('classes', ['offering_id' => $course->id, 'title' => 'Workshop', 'status' => 'scheduled',
            'starts_at' => now()->addDay(), 'ends_at' => now()->addDays(2)]);
        $data = $this->data('/dashboard');
        $this->assertArrayNotHasKey('table', $data);
        $this->assertSame(['=Outstanding', 'Workshop'], array_column($data['queue'], 'title'));
        $this->get($data['queue'][0]['href'])->assertOk();
        DB::table('assignments')->update(['closes_at' => now()]);
        $this->assertSame(['Workshop'], array_column($this->data('/dashboard')['queue'], 'title'));
        DB::table('enrolments')->where('student_id', $student->student->id)->where('offering_id', $course->id)
            ->update(['status' => 'withdrawn']);
        $this->assertSame([], $this->data('/dashboard')['queue']);
    }

    public function test_marking_desk_resolves_only_unmarked_current_work_with_an_allocation(): void
    {
        $course = $this->assessmentFixture($this->loginAs('ada'));
        $teacher = $this->loginAs('lecturer');
        $queue = $this->data('/dashboard')['queue'];
        $this->assertSame(['Submitted work'], array_column($queue, 'title'));
        $this->get(strtok($queue[0]['href'], '#'))->assertOk();
        $version = DB::table('submission_versions')->value('id');
        DB::table('assessment_scores')->where('revision', 1)->update(['submission_version_id' => $version]);
        $this->assertSame([], $this->data('/dashboard')['queue']);
        DB::table('examination_attempts')->update(['state' => 'awaiting_review']);
        $this->assertSame(['Exam One'], array_column($this->data('/dashboard')['queue'], 'title'));
        DB::table('teaching_allocations')->where('lecturer_id', $teacher->lecturer->id)->where('offering_id', $course->id)->delete();
        $this->assertSame([], $this->data('/dashboard')['queue']);
    }

    public function test_actual_role_permissions_determine_approval_queue(): void
    {
        $admin = $this->loginAs('officer');
        $version = Curriculum::factory()->create(['status' => 'reviewed']);
        $queue = $this->data('/dashboard')['queue'];
        $this->assertContains('Draft offering', array_column($queue, 'kind'));
        $this->assertNotContains('Curriculum approval', array_column($queue, 'kind'));
        app(ChangeRoleGrant::class)->apply($admin->id, 'super_admin', 'institution', false);
        $this->assertContains(route('academics.curriculum.show', $version, false), array_column($this->data('/dashboard')['queue'], 'href'));
        $this->loginAs('ada');
        $this->assertNotContains('Draft offering', array_column($this->data('/dashboard')['queue'], 'kind'));
    }

    public function test_only_the_active_candidate_can_resume_from_the_agenda(): void
    {
        $this->assessmentFixture($this->loginAs('ada'));
        DB::table('examination_attempts')->update(['state' => 'active', 'submitted_at' => null]);
        $this->assertContains('Resume exam', array_column($this->data('/dashboard')['queue'], 'action'));
        $this->loginAs('tunde');
        $this->assertNotContains('Resume exam', array_column($this->data('/dashboard')['queue'], 'action'));
        $this->loginAs('ada');
        DB::table('examination_attempts')->update(['expires_at' => now()]);
        $this->assertNotContains('Resume exam', array_column($this->data('/dashboard')['queue'], 'action'));
    }

    public function test_officer_can_inspect_latest_unpublished_pending_revision_from_the_queue(): void
    {
        $this->assessmentFixture($this->loginAs('ada'));
        $officer = User::factory()->create();
        app(ChangeRoleGrant::class)->apply($officer->id, 'examination_officer', 'institution', false);
        $this->actingAs($officer)->withSession(['security.mfa_user' => $officer->id]);
        DB::table('grades')->where('revision', 3)->update(['published_at' => null, 'moderation_status' => 'pending']);
        $data = $this->data('/dashboard');
        $this->assertSame('management', $data['workspace']);
        $this->assertSame(['Result moderation'], array_column($data['queue'], 'kind'));
        $this->assertSame('Revision 3', $data['queue'][0]['context']);
        $this->get($data['queue'][0]['href'])->assertOk();
        $this->loginAs('ada');
        $this->assertNotContains('Result moderation', array_column($this->data('/dashboard')['queue'], 'kind'));
    }
}
