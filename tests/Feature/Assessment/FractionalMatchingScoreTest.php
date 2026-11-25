<?php

namespace Tests\Feature\Assessment;

use App\Models\AssessmentItem;
use App\Models\AssessmentScore;
use App\Models\AttemptQuestion;
use App\Models\Examination;
use App\Models\ExaminationAttempt;
use Brick\Math\BigDecimal;
use PHPUnit\Framework\Attributes\DataProvider;

final class FractionalMatchingScoreTest extends AssessmentCase
{
    public static function awards(): array
    {
        return [
            'both pairs correct' => [2, '1.25', '10'],
            'one pair correct' => [1, '0.625', '9.375'],
        ];
    }

    #[DataProvider('awards')]
    public function test_fractional_slot_maximum_survives_scoring_and_manual_review(int $pairs, string $credit, string $total): void
    {
        $this->setupItems(['exam']);
        $item = AssessmentItem::sole();
        $this->post("/assessment-items/$item->id/exam", [
            'opens_at' => now()->subHour(), 'closes_at' => now()->addHour(),
            'duration_seconds' => 600, 'max_attempts' => 1,
            'questions' => [
                ['kind' => 'matching', 'topic' => 'Numbers', 'prompt' => 'Match the numerals',
                    'pairs' => "One => I\nTwo => II", 'points' => '1.25'],
                ['kind' => 'essay', 'topic' => 'Numbers', 'prompt' => 'Explain the notation', 'points' => '8.75'],
            ],
        ])->assertSessionHasNoErrors();
        $this->as($this->member->student->user)->post('/examinations/'.Examination::sole()->id.'/start')->assertRedirect();
        $paper = '/attempts/'.ExaminationAttempt::sole()->id;
        [$matching, $essay] = AttemptQuestion::with('version')->orderBy('position')->get()->all();
        $answers = array_slice($matching->version->marking_key['matching']['pairs'], 0, $pairs, true);
        $this->putJson("$paper/answers/$matching->id", ['revision' => 0, 'answer' => $answers])->assertOk();
        $this->post("$paper/finish")->assertRedirect();
        $this->assertTrue(BigDecimal::of((string) $matching->refresh()->awarded_points)->isEqualTo($credit));

        $this->as($this->marker)->post("$paper/review", [
            'base_revision' => 0, 'awards' => [$essay->id => '8.75'], 'reason' => 'Checked the explanation',
        ])->assertSessionHasNoErrors();
        $this->assertTrue(BigDecimal::of((string) AssessmentScore::sole()->points)->isEqualTo($total));
    }
}
