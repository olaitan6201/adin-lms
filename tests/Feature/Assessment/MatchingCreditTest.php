<?php

namespace Tests\Feature\Assessment;

use App\Models\AssessmentItem;
use App\Models\AssessmentScore;
use App\Models\AttemptQuestion;
use App\Models\Examination;
use App\Models\ExaminationAttempt;
use App\Models\ExaminationResponse;
use App\Models\QuestionVersion;
use Brick\Math\BigDecimal;
use Inertia\Testing\AssertableInertia as Page;

class MatchingCreditTest extends AssessmentCase
{
    public function test_matching_uses_opaque_independent_ids_and_awards_exact_partial_credit(): void
    {
        [$attempt, $question, $version] = $this->matchingAttempt([
            'Paris' => 'France',
            'Berlin' => 'Germany',
            'Madrid' => 'Spain',
            'Rome' => 'Italy',
        ]);
        $matching = $version->marking_key['matching'];
        $left = $matching['left'];
        $right = $matching['right'];
        $this->assertNotSame(['left-1', 'left-2', 'left-3', 'left-4'], array_column($left, 'id'));
        $this->assertEmpty(array_intersect(array_column($left, 'id'), array_column($right, 'id')));
        $this->assertEqualsCanonicalizing(array_column($right, 'id'), $question->option_order['right']);
        $this->get("/attempts/$attempt->id")->assertInertia(fn (Page $page) => $page
            ->where('questions.0.kind', 'matching')
            ->where('questions.0.matching.right.0.id', $question->option_order['right'][0])
            ->missing('questions.0.matching.pairs')
            ->missing('questions.0.marking_key'));

        $save = "/attempts/$attempt->id/answers/$question->id";
        $this->as($this->member->student->user)->putJson($save, [
            'revision' => 0,
            'answer' => [$left[0]['id'] => $right[0]['id'], $left[1]['id'] => $right[0]['id']],
        ])->assertUnprocessable();
        $this->assertSame(0, ExaminationResponse::count());
        $used = [
            $matching['pairs'][$left[0]['id']],
            $matching['pairs'][$left[1]['id']],
            $matching['pairs'][$left[2]['id']],
        ];
        $wrong = collect($right)->pluck('id')->first(fn (string $id): bool => ! in_array($id, $used, true));
        $answer = [
            $left[0]['id'] => $matching['pairs'][$left[0]['id']],
            $left[1]['id'] => $matching['pairs'][$left[1]['id']],
            $left[2]['id'] => $wrong,
        ];
        $this->putJson($save, ['revision' => 0, 'answer' => $answer])->assertOk()->assertJsonPath('revision', 1);
        $this->assertEquals(['value' => $answer], ExaminationResponse::sole()->answer);
        $this->post("/attempts/$attempt->id/finish")->assertRedirect();
        $this->assertTrue(BigDecimal::of($question->fresh()->awarded_points)->isEqualTo(5));
        $this->assertTrue(BigDecimal::of(AssessmentScore::sole()->points)->isEqualTo(5));
        $this->get("/attempts/$attempt->id")->assertInertia(fn (Page $page) => $page
            ->where('questions.0.value', fn ($map) => $map->all() == $answer)
            ->where('questions.0.revision', 1));
    }

    public function test_shuffled_matching_order_is_frozen_across_reloads(): void
    {
        [$attempt, $question, $version] = $this->matchingAttempt([
            'One' => 'First',
            'Two' => 'Second',
            'Three' => 'Third',
        ], true);
        $matching = $version->marking_key['matching'];
        $order = $question->option_order;

        $this->assertEqualsCanonicalizing(array_values($matching['pairs']), $order['right']);
        $this->get("/attempts/$attempt->id")->assertInertia(fn (Page $page) => $page
            ->where('questions.0.matching.right.0.id', $order['right'][0])
            ->where('questions.0.matching.right.1.id', $order['right'][1]));
        $this->assertSame($order, $question->fresh()->option_order);
    }

    public function test_matching_partial_credit_rounds_to_eight_decimal_places(): void
    {
        [$attempt, $question, $version] = $this->matchingAttempt([
            'One' => 'First',
            'Two' => 'Second',
            'Three' => 'Third',
        ]);
        $matching = $version->marking_key['matching'];
        $answer = [
            $matching['left'][0]['id'] => $matching['pairs'][$matching['left'][0]['id']],
            $matching['left'][1]['id'] => $matching['pairs'][$matching['left'][1]['id']],
        ];

        $this->as($this->member->student->user)->putJson("/attempts/$attempt->id/answers/$question->id", [
            'revision' => 0,
            'answer' => $answer,
        ])->assertOk();
        $this->post("/attempts/$attempt->id/finish")->assertRedirect();
        $this->assertSame('6.66666667', (string) $question->fresh()->awarded_points);
        $this->assertSame('6.66666667', (string) AssessmentScore::sole()->points);
    }

    private function matchingAttempt(array $pairs, bool $shuffle = false): array
    {
        $this->setupItems(['exam']);
        $item = AssessmentItem::sole();
        $lines = [];
        foreach ($pairs as $left => $right) {
            $lines[] = $left.' => '.$right;
        }

        $this->as($this->marker)->post("/courses/{$this->offering->id}/question-banks", [
            'topic' => 'Matching',
            'kind' => 'matching',
            'prompt' => 'Match each item',
            'pairs' => implode("\n", $lines),
        ])->assertRedirect();
        $version = QuestionVersion::sole();
        $this->as($this->marker)->post("/assessment-items/$item->id/exam", [
            'opens_at' => now()->subHour(),
            'closes_at' => now()->addHour(),
            'duration_seconds' => 600,
            'max_attempts' => 1,
            'shuffle' => $shuffle,
            'selections' => [['version_id' => $version->id, 'points' => '10']],
        ])->assertSessionHasNoErrors();
        $this->as($this->member->student->user)->post('/examinations/'.Examination::sole()->id.'/start')->assertRedirect();
        $attempt = ExaminationAttempt::sole();

        return [$attempt, AttemptQuestion::sole(), $version];
    }
}
