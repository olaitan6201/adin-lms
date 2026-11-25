<?php

namespace Tests\Feature\Assessment;

use App\Enums\Assessment\AttemptState;
use App\Models\AssessmentItem;
use App\Models\AssessmentScore;
use App\Models\AttemptQuestion;
use App\Models\Enrolment;
use App\Models\Examination;
use App\Models\ExaminationAttempt;
use Inertia\Testing\AssertableInertia as Page;

class AccommodationTest extends AssessmentCase
{
    public function test_only_an_officer_can_extend_an_individual_window_and_subjective_work_is_not_auto_scored(): void
    {
        $this->setupItems(['exam']);
        $item = AssessmentItem::firstOrFail();
        $this->post("/assessment-items/$item->id/exam", [
            'opens_at' => now()->subDays(2),
            'closes_at' => now()->subDay(),
            'duration_seconds' => 30,
            'max_attempts' => 1,
            'shuffle' => 1,
            'questions' => [
                [
                    'topic' => 'Development',
                    'prompt' => 'Review the code',
                    'kind' => 'programming',
                    'points' => '5',
                ],
                [
                    'topic' => 'Basics',
                    'prompt' => 'Choose one',
                    'kind' => 'mcq',
                    'options' => "First\nSecond",
                    'key' => 'Second',
                    'points' => '5',
                ],
            ],
        ])->assertRedirect()->assertSessionHasNoErrors();
        $exam = Examination::firstOrFail();
        $url = "/examinations/$exam->id";
        $data = [
            'enrolment' => $this->member->id,
            'opens_at' => now()->subHour()->toIso8601String(),
            'closes_at' => now()->addHour()->toIso8601String(),
            'duration_seconds' => 600,
            'max_attempts' => 2,
        ];
        $this->post("$url/accommodations", $data)->assertForbidden();
        $this->as($this->member->student->user)->post("$url/start")->assertUnprocessable();
        $this->as($this->officer)->post(
            "$url/accommodations",
            array_merge($data, ['enrolment' => Enrolment::factory()->create()->id]),
        )->assertNotFound();
        $this->post("$url/accommodations", $data)->assertRedirect();
        $other = Enrolment::factory()->create(['offering_id' => $this->offering->id]);
        $this->as($other->student->user)->post("$url/start")->assertUnprocessable();
        $this->as($this->member->student->user)->post("$url/start")->assertRedirect();
        $attempt = ExaminationAttempt::firstOrFail();
        $this->assertEquals(600, $attempt->started_at->diffInSeconds($attempt->expires_at));
        $choices = AttemptQuestion::where('attempt_id', $attempt->id)
            ->where('position', 2)
            ->firstOrFail()->option_order;
        $this->assertEqualsCanonicalizing(['First', 'Second'], $choices);
        $paper = "/attempts/$attempt->id";
        $this->get($paper)->assertInertia(fn (Page $p) => $p->where('questions.1.options', $choices));
        $this->post("$paper/finish")->assertRedirect();
        $this->assertSame(AttemptState::AwaitingReview, $attempt->fresh()->state);
        $this->assertSame(0, AssessmentScore::count());
        $this->get("$paper/review")->assertForbidden();
        $this->as($this->marker)->get("$paper/review")->assertOk();
        $this->post("$paper/review", [
            'points' => '6',
            'reason' => 'Manual rubric applied',
        ])->assertRedirect();
        $this->as($this->member->student->user)->post("$url/start")->assertRedirect();
        $this->assertDatabaseCount('examination_attempts', 2);
    }
}
