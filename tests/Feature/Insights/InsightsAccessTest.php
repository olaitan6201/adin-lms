<?php

namespace Tests\Feature\Insights;

use App\Models\AcademicSession;
use App\Models\CurriculumCourse;
use App\Models\Offering;
use App\Models\User;
use Illuminate\Support\Facades\DB;

final class InsightsAccessTest extends InsightCase
{
    public function test_management_figures_reconcile_for_selected_term_and_empty_session(): void
    {
        $this->travelTo(now()->parse('2026-11-24'));
        $this->loginAs('officer');
        $term = DB::table('semesters')->where('position', 1)->value('id');
        $member = DB::table('enrolments')->where('status', 'registered')->first();
        $module = DB::table('modules')->where('offering_id', $member->offering_id)->value('id');
        $this->record('lesson_progress', ['module_id' => $module, 'enrolment_id' => $member->id, 'last_seen' => now(), 'completed_at' => now()]);
        DB::table('enrolments')->where('id', $member->id)->update(['completed_at' => now()]);
        $metrics = $this->data("/reports?term=$term")['table']['totals'];
        foreach (['Courses' => 2, 'Published courses' => 2, 'Active lecturers' => 1, 'Participating departments' => 1,
            'Registered students' => 2, 'Registrations' => 3, 'Completed registrations' => 1, 'Engaged registrations' => 1,
            'Completed lessons' => 1, 'Active academic sessions' => 1, 'Offerings awaiting approval' => 0] as $name => $expected) {
            $this->assertSame($expected, $metrics[$name], $name);
        }

        $this->assertSame(1, $this->data('/reports')['table']['totals']['Offerings awaiting approval']);
        $empty = AcademicSession::factory()->create();
        $this->assertSame([], $this->data("/reports?session=$empty->id")['table']['rows']);
    }

    public function test_live_withdrawal_removes_course_and_denies_direct_reports_and_exports(): void
    {
        $this->get('/reports')->assertRedirect(route('login'));
        $user = $this->loginAs('ada');
        $member = DB::table('enrolments')->where('student_id', $user->student->id)->first();
        $q = '?offering='.$member->offering_id;
        $this->assertSame(1, $this->data('/reports'.$q)['table']['totals']['Registrations']);
        DB::table('enrolments')->where('id', $member->id)->update(['status' => 'withdrawn']);
        $this->assertSame(1, $this->data('/reports')['table']['totals']['Courses']);
        foreach (['/reports', '/reports/export/pdf', '/reports/export/xlsx'] as $url) {
            $this->get($url.$q)->assertNotFound();
        }

        $this->actingAs(User::factory()->create());
        $this->assertSame([], $this->data('/reports')['table']['rows']);
    }

    public function test_allocations_and_faculty_scope_are_checked_for_page_and_download(): void
    {
        $lecturer = $this->loginAs('lecturer');
        $course = Offering::where('status', 'published')->firstOrFail();
        $outside = Offering::factory()->create(['curriculum_course_id' => CurriculumCourse::factory()]);
        $this->assertSame(2, $this->data('/reports?offering='.Offering::where('external_offering_id', 'DEMO-CSC101-2026-1')->value('id'))['table']['totals']['Registrations']);
        $this->get("/reports/export/pdf?offering=$outside->id")->assertNotFound();
        DB::table('teaching_allocations')->where('lecturer_id', $lecturer->lecturer->id)->where('offering_id', $course->id)->delete();
        $this->get("/reports?offering=$course->id")->assertNotFound();
        $dean = User::factory()->create();
        $this->artisan('authority:grant', ['user' => $dean->id, 'role' => 'dean', 'scope' => 'faculty:'.$course->curriculumCourse->course->department->faculty_id])->assertSuccessful();
        $this->actingAs($dean)->withSession(['security.mfa_user' => $dean->id]);
        $this->assertSame('Academic unit', $this->data('/reports')['audience']);
        $this->get("/reports/export/xlsx?offering=$outside->id")->assertNotFound();
    }
}
