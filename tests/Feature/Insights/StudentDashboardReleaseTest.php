<?php

namespace Tests\Feature\Insights;

use App\Models\Grade;
use App\Services\Authority\ChangeRoleGrant;
use Illuminate\Support\Facades\DB;

final class StudentDashboardReleaseTest extends InsightCase
{
    use AssessmentFixture;

    public function test_latest_approved_publication_and_recipient_feedback_have_working_destinations(): void
    {
        $student = $this->loginAs('ada');
        $course = $this->assessmentFixture($student);
        $published = Grade::where('revision', 1)->sole();
        $next = Grade::where('revision', 2)->sole();
        $next->forceFill(['approved_by' => $student->id, 'approved_at' => now(), 'moderation_status' => 'approved',
            'published_at' => now()->addDay()])->save();
        $submission = DB::table('submissions')->sole();
        $version = DB::table('submission_versions')->sole();
        $item = DB::table('assignments')->where('id', $submission->assignment_id)->value('item_id');
        $score = ['item_id' => $item, 'enrolment_id' => $published->enrolment_id, 'submission_version_id' => $version->id,
            'changed_at' => now(), 'reason' => 'Returned assignment'];
        $this->record('assessment_scores', $score + ['revision' => 1, 'points' => 8, 'feedback' => 'Clear explanation', 'released_at' => now()]);
        $this->record('assessment_scores', $score + ['revision' => 2, 'points' => 9, 'feedback' => 'Private correction']);
        $rows = collect($this->data('/dashboard')['releases']);
        $this->assertCount(2, $rows);
        $sheet = $rows->firstWhere('download', true);
        $this->assertSame(route('assessment.sheet', $published, false), $sheet['href']);
        $this->get($sheet['href'])->assertOk()->assertJsonPath('grade', 'PASS');
        $feedback = $rows->firstWhere('download', false);
        $assignment = $this->data(strtok($feedback['href'], '#'));
        $this->assertSame('Clear explanation', $assignment['rows'][0]['scores'][0]['feedback']);
        $this->assertCount(1, $assignment['rows'][0]['scores']);
        $officer = $this->loginAs('officer');
        app(ChangeRoleGrant::class)->apply($officer->id, 'examination_officer', 'institution', false);
        $revision = Grade::forceCreate(['policy_id' => $published->policy_id, 'enrolment_id' => $published->enrolment_id,
            'revision' => 4, 'total_percent' => 94, 'grade' => 'A', 'moderation_status' => 'pending']);
        $review = route('assessment.moderate', $revision);
        $this->post($review, ['decision' => 'approve', 'reason' => 'Verified final revision'])->assertRedirect();
        $this->loginAs('ada');
        $this->assertSame($sheet['href'], collect($this->data('/dashboard')['releases'])->firstWhere('download', true)['href']);
        $this->loginAs('officer');
        $this->post($review, ['decision' => 'publish', 'reason' => 'Release to recipient'])->assertRedirect();
        $this->loginAs('ada');
        $rows = collect($this->data('/dashboard')['releases']);
        $this->assertSame(['Final grade: A · revision 4'], $rows->where('download', true)->pluck('detail')->values()->all());
        $this->loginAs('tunde');
        $this->assertSame([], $this->data('/dashboard')['releases']);
        $this->get($sheet['href'])->assertNotFound();
        $this->loginAs('ada');
        $course->forceFill(['status' => 'unpublished'])->save();
        $this->assertSame([], $this->data('/dashboard')['releases']);
        $course->forceFill(['status' => 'published'])->save();
        DB::table('submission_recipients')->where('version_id', $version->id)->delete();
        $this->assertCount(1, $this->data('/dashboard')['releases']);
        DB::table('enrolments')->where('id', $published->enrolment_id)->update(['status' => 'withdrawn']);
        $this->assertSame([], $this->data('/dashboard')['releases']);
        $this->get(route('assessment.sheet', $revision))->assertNotFound();
        $this->assertDatabaseHas('grades', ['id' => $revision->id]);
    }

    public function test_exam_agenda_observes_personal_window_and_attempt_limit_without_starting_an_attempt(): void
    {
        $this->freezeTime();
        $ada = $this->loginAs('ada');
        $course = $this->assessmentFixture($ada);
        $exam = DB::table('examinations')->sole();
        $examTask = fn () => collect($this->data('/dashboard')['queue'])->firstWhere('title', 'Exam One');
        $this->assertNull($examTask());
        $this->loginAs('tunde');
        $open = $examTask();
        $this->assertSame('Open exam · closes', $open['kind']);
        $this->assertSame(route('assessment.desk', $course, false).'#item-'.$exam->item_id, $open['href']);
        $this->get(strtok($open['href'], '#'))->assertOk();
        $this->assertDatabaseCount('examination_attempts', 1);
        $this->loginAs('ada');
        $opens = now()->addDays(2);
        $closes = now()->addDays(3);
        $this->record('accommodations', ['exam_id' => $exam->id, 'enrolment_id' => $ada->student->enrolments()->where('offering_id', $course->id)->value('id'),
            'approved_by' => $ada->id, 'overrides' => json_encode(['opens_at' => $opens, 'closes_at' => $closes, 'max_attempts' => 2])]);
        $scheduled = $examTask();
        $this->assertSame('Exam opens', $scheduled['kind']);
        $this->assertSame($opens->toIso8601String(), $scheduled['at']);
        $this->assertEqualsCanonicalizing(['title', 'context', 'kind', 'at', 'action', 'href'], array_keys($scheduled));
        $this->travelTo($opens);
        $this->assertSame('Open exam · closes', $examTask()['kind']);
        $this->loginAs('tunde');
        $this->assertNull($examTask());
        $this->loginAs('ada');
        $this->travelTo($closes);
        $this->assertNull($examTask());
    }
}
