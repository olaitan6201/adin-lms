<?php

namespace Tests\Feature\Insights;

use App\Models\Offering;
use App\Models\User;
use Illuminate\Support\Facades\DB;

trait AssessmentFixture
{
    private function assessmentFixture(User $student): Offering
    {
        $course = Offering::where('external_offering_id', 'DEMO-CSC101-2026-1')->firstOrFail();
        $member = DB::table('enrolments')->where('offering_id', $course->id)->where('student_id', $student->student->id)->value('id');
        $policy = $this->record('grading_policies', ['name' => 'Fixture', 'version' => 1, 'rounding_rule' => 'half_up']);
        $book = $this->record('gradebooks', ['offering_id' => $course->id, 'policy_id' => $policy]);
        $attrs = ['gradebook_id' => $book, 'weight_percent' => 50, 'maximum_score' => 100];
        $item = $this->record('assessment_items', $attrs + ['title' => 'Exam One', 'kind' => 'exam']);
        $exam = $this->record('examinations', ['item_id' => $item, 'opens_at' => now(), 'closes_at' => now()->addDay(),
            'duration_seconds' => 100, 'max_attempts' => 1, 'shuffle_options' => false]);
        $this->record('examination_attempts', ['exam_id' => $exam, 'enrolment_id' => $member, 'ordinal' => 1,
            'started_at' => now(), 'expires_at' => now()->addMinute(), 'state' => 'submitted', 'submitted_at' => now()]);
        $score = ['item_id' => $item, 'enrolment_id' => $member, 'reason' => 'Test', 'changed_at' => now()];
        $this->record('assessment_scores', $score + ['revision' => 1, 'points' => 45, 'released_at' => now()]);
        $this->record('assessment_scores', $score + ['revision' => 2, 'points' => 97]);
        $grade = ['policy_id' => $policy, 'enrolment_id' => $member];
        $this->record('grades', $grade + ['revision' => 1, 'total_percent' => 45, 'grade' => 'PASS',
            'moderation_status' => 'approved', 'approved_by' => $student->id, 'approved_at' => now(), 'published_at' => now()]);
        $this->record('grades', $grade + ['revision' => 2, 'total_percent' => 97, 'grade' => 'UNRELEASED']);
        $this->record('grades', $grade + ['revision' => 3, 'total_percent' => 98, 'grade' => 'NOT-MODERATED',
            'approved_by' => $student->id, 'approved_at' => now(), 'published_at' => now()]);
        $assignment = ['opens_at' => now()->subDay(), 'closes_at' => now()->addDay(), 'due_at' => now()->addHour(),
            'instructions' => 'Write', 'accepted_formats' => '[]', 'late_policy' => '{}', 'editable' => true, 'group_work' => false, 'max_bytes' => 100];
        foreach (['=Outstanding', 'Submitted work'] as $title) {
            $id = $this->record('assessment_items', $attrs + ['title' => $title, 'kind' => 'assignment']);
            $a = $this->record('assignments', $assignment + ['item_id' => $id]);
        }
        $sub = $this->record('submissions', ['assignment_id' => $a, 'enrolment_id' => $member]);
        $version = $this->record('submission_versions', ['submission_id' => $sub, 'revision' => 1,
            'receipt' => 'RECEIPT-ONE', 'submitted_at' => now(), 'submitted_by' => $student->id]);
        $this->record('submission_recipients', ['version_id' => $version, 'enrolment_id' => $member]);

        return $course;
    }
}
