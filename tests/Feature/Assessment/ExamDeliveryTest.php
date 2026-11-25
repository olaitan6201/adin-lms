<?php

namespace Tests\Feature\Assessment;

use App\Models\AssessmentItem;
use App\Models\AssessmentScore;
use App\Models\AttemptQuestion;
use App\Models\Enrolment;
use App\Models\Examination;
use App\Models\ExaminationAttempt;
use Brick\Math\BigDecimal;
use Inertia\Testing\AssertableInertia as Page;

class ExamDeliveryTest extends AssessmentCase
{
    public function test_reconnect_stale_autosave_ownership_and_idempotent_expiry(): void
    {
        $this->setupItems(['exam']);
        $item = AssessmentItem::firstOrFail();
        $this->post("/assessment-items/$item->id/exam", [
            'opens_at' => now()->subHour(),
            'closes_at' => now()->addHour(),
            'duration_seconds' => 30,
            'max_attempts' => 1,
            'shuffle' => 1,
            'questions' => [[
                'topic' => 'Topic',
                'prompt' => 'Fill the gap',
                'kind' => 'gap_fill',
                'key' => 'KEY_SECRET',
                'points' => '10',
                'draw' => 1,
            ]],
        ])->assertSessionHasNoErrors();
        $exam = Examination::firstOrFail();
        $start = "/examinations/$exam->id/start";
        $this->as($this->member->student->user)->post($start)->assertRedirect();
        $attempt = ExaminationAttempt::firstOrFail();
        $paper = "/attempts/$attempt->id";
        $this->post($start)->assertRedirect($paper);
        $this->assertDatabaseCount('examination_attempts', 1);
        $q = AttemptQuestion::firstOrFail();
        $save = "$paper/answers/$q->id";
        $this
            ->get($paper)
            ->assertDontSee('KEY_SECRET')
            ->assertInertia(fn (Page $p) => $p
                ->where('questions.0.id', $q->id)->missing('questions.0.marking_key'));
        $this->putJson($save, ['revision' => 0, 'answer' => 'draft'])->assertOk()->assertJsonPath('revision', 1);
        $this->putJson($save, ['revision' => 1, 'answer' => 'KEY_SECRET'])->assertOk()->assertJsonPath('revision', 2);
        $this->putJson($save, ['revision' => 0, 'answer' => 'stale'])->assertConflict();
        $this
            ->get($paper)
            ->assertInertia(fn (Page $p) => $p
                ->where('questions.0.revision', 2)
                ->where('questions.0.value', 'KEY_SECRET'));
        $other = Enrolment::factory()->create(['offering_id' => $this->offering->id]);
        $this->as($other->student->user)->putJson($save, ['revision' => 2, 'answer' => 'unauthorized'])
            ->assertNotFound();
        $this->travel(31)->seconds();
        $this->as($this->member->student->user)->putJson($save, ['revision' => 2, 'answer' => 'late'])
            ->assertConflict();
        $this->artisan('assessments:expire')->assertSuccessful();
        $this->artisan('assessments:expire')->assertSuccessful();
        $this->post($start)->assertConflict();
        $this->assertDatabaseHas('assessment_scores', [
            'points' => 10,
            'released_at' => null,
            'attempt_id' => $attempt->id,
        ]);
        $this->assertSame(1, AssessmentScore::count());
        $this->get($this->desk)->assertInertia(fn (Page $p) => $p->where('items.0.returned', null));
        $this->as($this->marker)->post("$paper/review", [
            'base_revision' => 1,
            'reason' => 'Verified',
            'release' => 1,
        ])->assertRedirect();
        $this->as($this->member->student->user)
            ->get($this->desk)
            ->assertInertia(fn (Page $p) => $p
                ->where('items.0.returned', fn ($value) => BigDecimal::of((string) $value)->isEqualTo(10)));
    }
}
