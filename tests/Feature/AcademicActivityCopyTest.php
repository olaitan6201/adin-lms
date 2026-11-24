<?php

namespace Tests\Feature;

use App\Models\AssessmentItem;
use App\Models\AssessmentScore;
use App\Models\Assignment;
use App\Models\Attendance;
use App\Models\ClassSession;
use App\Models\Gradebook;
use App\Models\GradingPolicy;
use App\Models\Module;
use App\Models\Offering;
use App\Models\Submission;
use Database\Seeders\DemoCampusSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Support\AcademicAccess;
use Tests\TestCase;

class AcademicActivityCopyTest extends TestCase
{
    use AcademicAccess, RefreshDatabase;

    public function test_activity_copy_reanchors_schedule_without_copying_learner_work(): void
    {
        $this->seed(DemoCampusSeeder::class);
        $actor = $this->academicUser();
        $from = Offering::where('external_offering_id', 'DEMO-CSC101-2026-1')->sole();
        $into = Offering::where('external_offering_id', 'DEMO-CSC101-2026-2')->sole();
        $enrolment = $from->enrolments()->firstOrFail();
        $class = ClassSession::forceCreate(['offering_id' => $from->id, 'title' => 'Seminar', 'status' => 'held', 'starts_at' => '2026-09-02 12:00:00', 'ends_at' => '2026-09-02 13:00:00', 'meeting_url' => 'https://example.org/old-session']);
        Attendance::forceCreate(['class_id' => $class->id, 'user_id' => $enrolment->student->user_id, 'status' => 'present', 'recorded_at' => now(), 'method' => 'manual']);
        $policy = GradingPolicy::forceCreate(['name' => 'Term policy', 'version' => 1, 'rounding_rule' => 'half_up']);
        $book = Gradebook::forceCreate(['offering_id' => $from->id, 'policy_id' => $policy->id]);
        $item = AssessmentItem::forceCreate(['gradebook_id' => $book->id, 'module_id' => Module::where('offering_id', $from->id)->sole()->id,
            'title' => 'Worksheet', 'kind' => 'assignment', 'maximum_score' => 10, 'weight_percent' => 100]);
        $assignment = Assignment::forceCreate(['item_id' => $item->id, 'instructions' => 'Explain the concept.', 'opens_at' => '2026-09-02', 'due_at' => '2026-09-05', 'closes_at' => '2026-09-05',
            'accepted_formats' => ['pdf'], 'max_bytes' => 4000, 'late_policy' => [], 'editable' => true, 'group_work' => false]);
        Submission::forceCreate(['assignment_id' => $assignment->id, 'enrolment_id' => $enrolment->id]);
        AssessmentScore::forceCreate(['item_id' => $item->id, 'enrolment_id' => $enrolment->id, 'revision' => 1, 'points' => 5, 'reason' => 'Marked', 'changed_at' => now(), 'changed_by' => $actor->id]);
        $this->post("/academics/delivery/$into->id/copy", ['source_id' => $from->id])->assertSessionHasNoErrors();
        $copiedClass = ClassSession::where('offering_id', $into->id)->sole();
        $this->assertNull($copiedClass->meeting_url);
        $this->assertSame('scheduled', $copiedClass->status);
        $this->assertSame('2027-02-02', $copiedClass->starts_at->toDateString());
        $newItem = AssessmentItem::where('gradebook_id', Gradebook::where('offering_id', $into->id)->value('id'))->sole();
        $this->assertSame($into->id, Module::findOrFail($newItem->module_id)->offering_id);
        $newAssignment = Assignment::where('item_id', $newItem->id)->sole();
        $this->assertSame('2027-02-05', $newAssignment->due_at->toDateString());
        $this->assertDatabaseCount('submissions', 1);
        $this->assertDatabaseCount('assessment_scores', 1);
        $this->assertDatabaseCount('attendance', 1);
    }
}
