<?php

namespace Tests\Feature\Insights;

use App\Enums\ReportFamily;
use App\Enums\RoleCode;
use App\Models\Curriculum;
use App\Models\Department;
use App\Models\Offering;
use App\Models\User;
use App\Services\Authority\ChangeRoleGrant;
use App\Services\Security\TotpEnrollment;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use PragmaRX\Google2FA\Google2FA;

final class AdminOverviewTest extends InsightCase
{
    use AssessmentFixture;

    public function test_sign_in_and_mfa_land_on_admin_overview_and_the_shared_dashboard_keeps_its_own_route(): void
    {
        $admin = User::where('email', 'officer@demo.example.test')->firstOrFail();
        $secret = app(TotpEnrollment::class)->issue($admin);
        $this->post(route('login.store'), ['email' => $admin->email, 'password' => 'password'])
            ->assertRedirectToRoute('admin.overview');
        $this->get(route('admin.overview'))->assertRedirectToRoute('security.challenge');
        $this->post(route('security.verify'), ['code' => (new Google2FA)->getCurrentOtp($secret)])
            ->assertRedirectToRoute('admin.overview');
        $this->get(route('home'))->assertRedirectToRoute('admin.overview');
        $this->assertSame('/admin/overview', $this->data(route('admin.overview'))['workspaceHome']);

        $offering = Offering::firstOrFail();
        $filters = ['offering' => $offering->id, 'family' => ReportFamily::InstitutionUsage->value];

        $this->get(route('insights.dashboard'))->assertOk();
        $this->get(route('insights.dashboard', $filters))->assertRedirect(route('insights.reports', $filters));
    }

    public function test_overview_rejects_guests_and_department_scope_and_keeps_the_department_dashboard(): void
    {
        $head = User::factory()->create();
        app(ChangeRoleGrant::class)->apply($head->id, RoleCode::HeadOfDepartment, 'department:'.Department::firstOrFail()->id, false);
        $url = route('admin.overview');

        $this->get($url)->assertRedirect(route('login'));
        $this->actingAs($head)->withSession(['security.mfa_user' => $head->id])->get($url)->assertForbidden();
        $this->assertSame('Academic unit', $this->data('/dashboard')['audience']);

        $ict = User::factory()->create();
        app(ChangeRoleGrant::class)->apply($ict->id, RoleCode::IctAdmin, 'institution', false);
        $this->actingAs($ict)->withSession(['security.mfa_user' => $ict->id])->get($url)->assertForbidden();
    }

    public function test_guest_admin_bookmark_does_not_override_a_students_landing(): void
    {
        $student = User::where('email', 'ada@demo.example.test')->firstOrFail();

        $this->get(route('admin.overview'))->assertRedirectToRoute('login');
        $this->post(route('login.store'), ['email' => $student->email, 'password' => 'password'])
            ->assertRedirectToRoute('insights.dashboard');
        $this->get(route('admin.overview'))->assertForbidden();
    }

    public function test_overview_uses_live_counts_and_action_grants_without_claiming_history_or_telemetry(): void
    {
        $this->travelTo(now()->parse('2026-11-26 12:00:00 UTC'));
        $this->assessmentFixture($this->loginAs('ada'));
        $admin = $this->loginAs('officer');
        $approval = Curriculum::factory()->create(['status' => 'reviewed']);
        $enrolment = DB::table('enrolments')->where('status', 'registered')->orderBy('id')->value('id');
        DB::table('enrolments')->where('id', $enrolment)->update(['completed_at' => now()]);

        $page = $this->get(route('admin.overview'))->assertOk()->viewData('page');
        $overview = $page['props']['overview'];

        $this->assertSame('Admin/Overview', $page['component']);
        $this->assertTrue($page['props']['signedIn']);
        $this->assertSame(
            ['Registered students' => '2', 'Published offerings' => '2', 'Allocated lecturers' => '1', 'Registrations completed' => '33%'],
            array_column($overview['tiles'], 'value', 'label'),
        );
        $this->assertSame([], $overview['enrolment']['values']);
        $this->assertSame([], $overview['delivery']['values']);
        $this->assertSame([], $overview['service']['metrics']);
        $this->assertFalse($overview['examinations']['available']);
        $this->assertSame([], $overview['examinations']['exams']);
        $this->assertTrue(Str::isUuid($overview['participation']['metrics'][0]['id']));
        $this->assertSame(33, $overview['participation']['metrics'][0]['value']);
        $this->assertSame(['Draft offering'], array_column($overview['approvals'], 'status'));
        $this->assertEqualsCanonicalizing(
            ['Assignment revision received', 'Exam attempt started'],
            array_column($overview['activity'], 'action'),
        );
        $this->assertStringNotContainsString('UNRELEASED', json_encode($overview, JSON_THROW_ON_ERROR));
        $this->get($overview['approvals'][0]['href'])->assertOk();
        app(ChangeRoleGrant::class)->apply($admin->id, RoleCode::SuperAdmin, 'institution', false);
        $this->assertContains(
            route('academics.curriculum.show', $approval, false),
            array_column($this->data(route('admin.overview'))['overview']['approvals'], 'href'),
        );
    }

    public function test_institution_overview_preserves_term_selection_and_rejects_an_unknown_term(): void
    {
        $this->loginAs('officer');
        $draft = Offering::where('status', 'draft')->firstOrFail();

        $overview = $this->data(route('admin.overview', ['term' => $draft->semester_id]))['overview'];

        $this->assertSame('2026/27 (demo) · Semester 2', $overview['enrolment']['session']);
        $this->assertSame('0', $overview['tiles'][1]['value']);
        $this->assertNull($overview['tiles'][3]['value']);
        $this->get(route('admin.overview', ['term' => (string) Str::uuid7()]))->assertNotFound();
        $this->getJson(route('admin.overview', ['offering' => $draft->id]))->assertUnprocessable();
    }

    public function test_exam_grant_enables_window_metadata_and_latest_bank_counts_without_question_content(): void
    {
        $this->travelTo(now()->parse('2026-11-26 12:00:00 UTC'));
        $offering = $this->assessmentFixture($this->loginAs('ada'));
        $bank = $this->record('question_banks', [
            'course_id' => $offering->curriculumCourse->course_id,
            'topic' => 'Bank topic',
        ]);
        $question = $this->record('questions', ['bank_id' => $bank]);
        foreach ([1 => 'essay', 2 => 'true_false'] as $revision => $kind) {
            $this->record('question_versions', [
                'question_id' => $question,
                'revision' => $revision,
                'kind' => $kind,
                'prompt' => 'Private prompt',
                'marking_key' => '{"answer":"private-key"}',
            ]);
        }
        $admin = $this->loginAs('officer');
        app(ChangeRoleGrant::class)->apply($admin->id, RoleCode::ExaminationOfficer, 'institution', false);

        $examinations = $this->data(route('admin.overview', ['term' => $offering->semester_id]))['overview']['examinations'];

        $this->assertSame([['label' => 'Objective', 'value' => 1, 'color' => '#10B981']], $examinations['bank']);
        $this->assertSame([[
            'id' => DB::table('examinations')->value('id'),
            'title' => 'Exam One',
            'meta' => 'DEMO-CSC101-2026-1 · Closes 27 Nov 2026, 12:00 UTC',
            'status' => 'Open',
        ]], $examinations['exams']);
        $this->assertStringNotContainsString('private-key', json_encode($examinations, JSON_THROW_ON_ERROR));
    }
}
