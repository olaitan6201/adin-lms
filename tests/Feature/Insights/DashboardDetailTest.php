<?php

namespace Tests\Feature\Insights;

use App\Models\AcademicSession;
use App\Models\Offering;
use App\Models\Semester;
use App\Models\User;
use App\Services\Authority\ChangeRoleGrant;
use Illuminate\Support\Facades\DB;

final class DashboardDetailTest extends InsightCase
{
    use AssessmentFixture;

    public function test_period_changes_totals_courses_and_queue_on_dashboard(): void
    {
        $this->loginAs('officer');
        $first = Offering::where('external_offering_id', 'DEMO-CSC101-2026-1')->firstOrFail();
        $draft = Offering::where('status', 'draft')->firstOrFail();
        $past = AcademicSession::factory()->create(['starts_on' => '2020-01-01', 'ends_on' => '2020-12-31']);
        $term = Semester::factory()->create(['session_id' => $past->id, 'starts_on' => '2020-01-01', 'ends_on' => '2020-06-30']);
        $draft->semester_id = $term->id;
        $draft->save();
        $firstData = $this->data('/dashboard?term='.$first->semester_id);
        $this->assertSame(2, $firstData['period']['summary']['Offerings']);
        $this->assertSame([], $firstData['queue']);
        $history = $this->data('/dashboard?session='.$past->id);
        $this->assertSame(1, $history['period']['summary']['Offerings']);
        $this->assertSame([$draft->external_offering_id], array_column($history['courses'], 'code'));
        $this->assertSame(['Draft offering'], array_column($history['queue'], 'kind'));
        $this->assertNull($history['population']);
        $this->get("/dashboard?session=$past->id&term=$first->semester_id")->assertNotFound();

        $dean = User::factory()->create();
        app(ChangeRoleGrant::class)->apply($dean->id, 'dean', 'faculty:'.$first->curriculumCourse->course->department->faculty_id, false);
        $this->actingAs($dean)->withSession(['security.mfa_user' => $dean->id]);
        $foreign = Offering::factory()->create(['semester_id' => Semester::factory()]);
        $this->get('/dashboard?term='.$foreign->semester_id)->assertNotFound();
        $scoped = $this->data('/dashboard');
        $this->assertNull($scoped['activity']['usage']);
        $this->assertNotContains($foreign->semester_id, array_column($scoped['period']['terms'], 'id'));
    }

    public function test_usage_window_counts_events_and_distinct_accounts_but_is_not_shared_with_exam_office(): void
    {
        $this->freezeSecond();
        $ada = $this->loginAs('ada');
        $this->assessmentFixture($ada);
        foreach ([now(), now()->subDay(), now()->subDays(7), now()->addSecond()] as $at) {
            $this->record('login_events', ['user_id' => $ada->id, 'outcome' => 'password.accepted', 'occurred_at' => $at]);
        }
        $this->loginAs('officer');
        $activity = $this->data('/dashboard')['activity'];
        $this->assertSame(['Assignment revisions received' => 1, 'Exam attempts started' => 1], $activity['academic']);
        $this->assertSame(['Credential acceptances' => 2, 'Accounts with accepted credentials' => 1], $activity['usage']);
        $this->assertEqualsCanonicalizing(['Exam One', 'Submitted work'], array_column($activity['latest'], 'title'));
        $this->assertSame(now()->subDays(7)->toIso8601String(), $activity['from']);
        $officer = User::factory()->create();
        app(ChangeRoleGrant::class)->apply($officer->id, 'examination_officer', 'institution', false);
        $this->actingAs($officer)->withSession(['security.mfa_user' => $officer->id]);
        DB::table('grades')->where('revision', 3)->update(['published_at' => null, 'moderation_status' => 'pending']);
        $office = $this->data('/dashboard');
        $this->assertNull($office['activity']);
        $this->assertSame('Result moderation', $office['queue'][0]['kind']);
    }

    public function test_upcoming_exam_is_independent_of_marking_and_allocation(): void
    {
        $course = $this->assessmentFixture($this->loginAs('ada'));
        DB::table('examinations')->update(['opens_at' => now()->addDay(), 'closes_at' => now()->addDays(2)]);
        DB::table('examination_attempts')->delete();
        $lecturer = $this->loginAs('lecturer');
        $file = $this->record('files', ['object_key' => 'dashboard/week', 'filename' => 'week.pdf', 'media_type' => 'application/pdf',
            'size_bytes' => 20, 'checksum' => hash('sha256', 'week'), 'validation_status' => 'clean']);
        $material = DB::table('learning_materials as r')->join('modules as m', 'm.id', '=', 'r.module_id')->where('m.offering_id', $course->id)->value('r.id');
        $this->record('material_versions', ['material_id' => $material, 'revision' => 2, 'created_by' => $lecturer->id, 'created_at' => now(), 'file_id' => $file]);
        $data = $this->data('/dashboard');
        $this->assertSame(['Exam One'], array_column($data['teaching']['exams'], 'title'));
        $this->assertNotContains('Exam One', array_column($data['queue'], 'title'));
        $this->assertSame(['First reading'], array_column($data['teaching']['uploads'], 'title'));
        $this->assertSame(1, $data['teaching']['summary']['My uploaded file revisions']);
        $this->assertCount(2, $data['teaching']['assignments']);
        $this->assertContains('Ada Demo', array_column($data['teaching']['members'], 'title'));
        $this->assertSame('45.00', $data['teaching']['mean']);
        $this->assertSame(2, $data['teaching']['summary']['Enrolled students']);
        $this->assertSame(['Submitted work'], array_column($data['teaching']['submissions'], 'title'));
        DB::table('teaching_allocations')->where('offering_id', $course->id)->delete();
        $this->assertSame([], $this->data('/dashboard')['teaching']['exams']);
    }

    public function test_study_shelf_tracks_own_released_lessons_notices_and_live_membership(): void
    {
        $ada = $this->loginAs('ada');
        $course = Offering::where('external_offering_id', 'DEMO-CSC101-2026-1')->firstOrFail();
        $lesson = DB::table('modules')->where('offering_id', $course->id)->value('id');
        $member = DB::table('enrolments')->where('offering_id', $course->id)->where('student_id', $ada->student->id)->value('id');
        $this->record('lesson_progress', ['module_id' => $lesson, 'enrolment_id' => $member, 'last_seen' => now(), 'completed_at' => now()]);
        foreach (['Published' => now(), 'Scheduled' => now()->addHour()] as $body => $at) {
            $this->record('announcements', ['offering_id' => $course->id, 'author_id' => $ada->id, 'body' => $body, 'published_at' => $at]);
        }
        $study = $this->data('/dashboard')['study'];
        $this->assertSame(1, $study['completed']);
        $this->assertContains($course->external_offering_id, array_column($study['materials'], 'context'));
        $this->assertSame(['Published'], array_column($study['announcements'], 'title'));
        $this->loginAs('tunde');
        $this->assertSame(0, $this->data('/dashboard')['study']['completed']);
        $this->loginAs('ada');
        DB::table('learning_materials')->where('module_id', $lesson)->update(['opens_at' => now()->addDay()]);
        $this->assertNotContains($course->external_offering_id, array_column($this->data('/dashboard')['study']['materials'], 'context'));
        DB::table('learning_materials')->where('module_id', $lesson)->update(['opens_at' => null, 'restrictions' => '{"private":true}']);
        $this->assertNotContains($course->external_offering_id, array_column($this->data('/dashboard')['study']['materials'], 'context'));
        DB::table('modules')->where('id', $lesson)->update(['kind' => 'draft:chapter']);
        $hidden = $this->data('/dashboard')['study'];
        $this->assertNotContains($course->external_offering_id, array_column($hidden['materials'], 'context'));
        $this->assertSame(0, $hidden['completed']);
        DB::table('enrolments')->where('student_id', $ada->student->id)->update(['status' => 'withdrawn']);
        $empty = $this->data('/dashboard')['study'];
        $this->assertSame([], $empty['announcements']);
        $this->assertSame([], $empty['materials']);
        $this->assertSame(0, $empty['available']);
    }
}
