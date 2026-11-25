<?php

namespace Tests\Feature\Assessment;

use App\Models\AssessmentItem;
use App\Models\AssessmentScore;
use App\Models\AttemptQuestion;
use App\Models\Examination;
use App\Models\ExaminationAttempt;
use Brick\Math\BigDecimal;
use Inertia\Testing\AssertableInertia as Page;

class MixedPaperMarkTest extends AssessmentCase
{
    public function test_two_subjective_awards_and_fixed_objective_points_are_versioned_together(): void
    {
        $this->setupItems(['exam']);
        $item = AssessmentItem::sole();
        $this->post("/assessment-items/$item->id/exam", [
            'opens_at' => now()->subHour(), 'closes_at' => now()->addHour(),
            'duration_seconds' => 600, 'max_attempts' => 1,
            'questions' => [
                ['kind' => 'gap_fill', 'topic' => 'Basics', 'prompt' => 'Fill', 'key' => 'four', 'points' => 2],
                ['kind' => 'essay', 'topic' => 'Theory', 'prompt' => 'Explain', 'points' => 3],
                ['kind' => 'programming', 'topic' => 'Lab', 'prompt' => 'Write a loop', 'points' => 5],
            ],
        ])->assertSessionHasNoErrors();
        $user = $this->member->student->user;
        $this->as($user)->post('/examinations/'.Examination::sole()->id.'/start')->assertRedirect();
        $attempt = ExaminationAttempt::sole();
        $paper = "/attempts/$attempt->id";
        [$objective, $essay, $lab] = AttemptQuestion::orderBy('position')->pluck('id')->all();
        $this->putJson("$paper/answers/$objective", ['revision' => 0, 'answer' => 'four'])->assertOk();
        $this->post("$paper/finish")->assertRedirect();
        $mark = "$paper/review";
        $base = ['base_revision' => 0, 'reason' => 'Checked against solutions'];
        $this->as($this->marker)->postJson($mark, $base + ['awards' => [$essay => 2]])->assertUnprocessable();
        $this->postJson($mark, $base + ['awards' => [$essay => 2, $lab => 6]])->assertUnprocessable();
        $this->postJson($mark, $base + ['awards' => [$essay => 2, $lab => 4, $objective => 0]])->assertUnprocessable();
        $this->assertNull(AttemptQuestion::findOrFail($essay)->awarded_points);
        $this->assertDatabaseCount('assessment_scores', 0);
        $this->post($mark, $base + ['awards' => [$essay => '2.5', $lab => '4']])->assertSessionHasNoErrors();
        $this->assertTrue(BigDecimal::of((string) AssessmentScore::sole()->points)->isEqualTo('8.5'));
        $this->post($mark, $base + ['awards' => [$essay => '1']])->assertConflict();
        $this->as($user)->get($this->desk)->assertInertia(fn (Page $p) => $p->where('items.0.returned', null));
        $this->as($this->marker)->post($mark, [
            'base_revision' => 1, 'reason' => 'Corrected essay award', 'awards' => [$essay => 3], 'release' => 1,
        ])->assertSessionHasNoErrors();
        $this->get($mark)->assertInertia(fn (Page $p) => $p->where('revision', 2)->has('history', 2)
            ->where('history.0.awards.1.points', '3')->where('history.1.awards.1.points', '2.5'));
        $this->as($user)->get($this->desk)->assertInertia(fn (Page $p) => $p
            ->where('items.0.returned', fn ($v) => BigDecimal::of((string) $v)->isEqualTo(9)));
    }
}
