<?php

namespace Tests\Feature\Community;

use App\Models\Announcement;
use App\Models\AssessmentItem;
use App\Models\AssessmentScore;
use App\Models\Assignment;
use App\Models\Enrolment;
use App\Models\Examination;
use App\Models\Gradebook;
use App\Models\GradingPolicy;
use App\Models\MaterialVersion;
use App\Models\Notification;
use App\Models\NotificationDelivery;
use App\Models\Offering;
use App\Models\Submission;
use App\Models\SubmissionVersion;
use App\Services\Community\ScanAcademicNotices;

class AcademicNoticeTest extends CommunityTestCase
{
    public function test_scheduled_assignment_opening_and_deadline_survive_an_entire_missed_window(): void
    {
        $course = $this->course();
        [$existing] = $this->assessments($course);
        $item = $existing->item->replicate();
        $item->save();
        $future = $existing->replicate()->forceFill([
            'item_id' => $item->id,
            'opens_at' => now()->addHours(30), 'due_at' => now()->addHours(31), 'closes_at' => now()->addHours(32),
        ]);
        $future->save();
        $key = 'assignment:'.$future->id;
        $this->assertDatabaseMissing('notifications', ['event_key' => $key]);
        $this->assertDatabaseHas('jobs', ['queue' => 'academic-releases']);
        $this->artisan('community:notify')->assertSuccessful();
        $this->travel(1)->hour();
        $joined = Enrolment::factory()->create(['offering_id' => $course->id, 'enrolled_at' => null]);
        $this->person('tunde')->student->enrolments()->where('offering_id', $course->id)->update(['status' => 'withdrawn']);
        $this->travel(33)->hours();
        Enrolment::factory()->create(['offering_id' => $course->id]);
        $this->artisan('community:notify')->assertSuccessful();
        $this->artisan('community:notify')->assertSuccessful();
        foreach ([$key, 'deadline:'.$future->id.':'.$future->due_at->timestamp] as $event) {
            $notices = Notification::where('event_key', $event);
            $this->assertEqualsCanonicalizing([$this->person('ada')->id, $joined->student->user_id], $notices->pluck('recipient_id')->all());
            $this->assertSame(2, NotificationDelivery::whereIn('notification_id', $notices->select('id'))->count());
        }
    }

    public function test_scanning_domain_state_twice_notifies_only_the_correct_people_for_each_event(): void
    {
        $course = $this->course();
        $ada = $this->person('ada');
        $teacher = $this->person('lecturer');
        $other = $this->person('tunde');
        $enrolment = $ada->student->enrolments()->where('offering_id', $course->id)->sole();
        [$assignment, $exam] = $this->assessments($course);
        $score = AssessmentScore::forceCreate([
            'item_id' => $exam->item_id,
            'enrolment_id' => $enrolment->id,
            'revision' => 1,
            'points' => 88,
            'changed_at' => now(),
            'reason' => 'Initial',
        ]);
        $submission = Submission::forceCreate([
            'assignment_id' => $assignment->id,
            'enrolment_id' => $enrolment->id,
        ]);
        $version = SubmissionVersion::forceCreate([
            'submission_id' => $submission->id,
            'revision' => 1,
            'receipt' => 'A1',
            'submitted_at' => now(),
            'submitted_by' => $ada->id,
        ]);
        $announcement = Announcement::forceCreate([
            'author_id' => $teacher->id,
            'offering_id' => $course->id,
            'published_at' => now(),
            'body' => 'Course news',
        ]);
        $admin = Announcement::forceCreate([
            'author_id' => $this->person('officer')->id,
            'published_at' => now(),
            'body' => 'Campus news',
        ]);
        $material = MaterialVersion::whereHas(
            'material.module',
            fn ($q) => $q->where('offering_id', $course->id),
        )->sole();
        $scanner = app(ScanAcademicNotices::class);
        $scanner->run();
        $this->assertDatabaseMissing('notifications', ['event_key' => 'result:'.$score->id]);
        $score->released_at = now();
        $score->save();
        $scanner->run();
        $scanner->run();
        $learners = [$ada->id, $other->id];
        $audiences = [
            "course:$course->id" => $learners,
            "material:$material->id" => $learners,
            "assignment:$assignment->id" => $learners,
            "deadline:$assignment->id:".$assignment->due_at->timestamp => $learners,
            "exam:$exam->id:".$exam->opens_at->timestamp => $learners,
            "submission:$version->id" => [$teacher->id],
            "result:$score->id" => [$ada->id],
            "announcement:$announcement->id" => [...$learners, $teacher->id],
            "admin:$admin->id" => [...$learners, $teacher->id, $admin->author_id],
        ];

        foreach ($audiences as $key => $recipients) {
            $this->assertEqualsCanonicalizing(
                $recipients,
                Notification::where('event_key', $key)->pluck('recipient_id')->all(),
                $key,
            );
        }

        $this->assertDatabaseMissing('notifications', [
            'event_key' => 'course:'.Offering::where('status', 'draft')->sole()->id,
        ]);
        $this->assertDatabaseMissing('notifications', [
            'event_key' => 'course:'.Offering::where('external_offering_id', 'DEMO-CSC102-2026-1')->sole()->id,
            'recipient_id' => $other->id,
        ]);
    }

    /** @return array{Assignment, Examination} */
    private function assessments(Offering $course): array
    {
        $policy = GradingPolicy::forceCreate([
            'name' => 'Policy',
            'version' => 1,
            'rounding_rule' => 'half_up',
        ]);
        $book = Gradebook::forceCreate(['offering_id' => $course->id, 'policy_id' => $policy->id]);
        $item = fn (string $kind) => AssessmentItem::forceCreate([
            'gradebook_id' => $book->id,
            'kind' => $kind,
            'title' => $kind,
            'weight_percent' => 50,
            'maximum_score' => 100,
        ]);
        $assignment = Assignment::forceCreate([
            'item_id' => $item('assignment')->id,
            'instructions' => 'Write notes',
            'opens_at' => now()->subDay(),
            'due_at' => now()->addHours(6),
            'closes_at' => now()->addDay(),
            'accepted_formats' => [],
            'max_bytes' => 100,
            'late_policy' => [],
            'editable' => true,
            'group_work' => false,
        ]);
        $exam = Examination::forceCreate([
            'item_id' => $item('exam')->id,
            'opens_at' => now()->addDay(),
            'closes_at' => now()->addDays(2),
            'duration_seconds' => 60,
            'max_attempts' => 1,
            'shuffle_options' => false,
        ]);

        return [$assignment, $exam];
    }
}
