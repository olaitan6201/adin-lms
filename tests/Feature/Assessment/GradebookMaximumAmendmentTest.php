<?php

namespace Tests\Feature\Assessment;

use App\Models\AssessmentItem;
use App\Models\Examination;
use App\Models\ExamSlot;
use App\Models\GradingPolicy;
use App\Models\QuestionBank;
use Brick\Math\BigDecimal;

class GradebookMaximumAmendmentTest extends AssessmentCase
{
    public function test_exam_maximum_is_locked_once_slot_maxima_are_configured(): void
    {
        $this->setupItems(['exam']);
        $item = AssessmentItem::firstOrFail();
        $bank = QuestionBank::forceCreate([
            'course_id' => $this->offering->curriculumCourse->course_id,
            'topic' => 'Configured slots',
        ]);
        $exam = Examination::forceCreate([
            'item_id' => $item->id,
            'opens_at' => now()->subHour(),
            'closes_at' => now()->addHour(),
            'duration_seconds' => 3600,
            'max_attempts' => 1,
            'shuffle_options' => false,
        ]);
        ExamSlot::forceCreate([
            'exam_id' => $exam->id,
            'position' => 1,
            'draw_from_bank_id' => $bank->id,
            'points' => '10',
        ]);
        $base = [
            'id' => $item->id,
            'title' => $item->title,
            'kind' => 'exam',
            'weight' => '100',
        ];

        $this->as($this->officer)->post($this->desk, [
            'reason' => 'Change configured maximum',
            'rounding' => 'half_up',
            'boundaries' => [['minimum' => '0', 'grade' => 'F']],
            'items' => [$base + ['maximum' => '11']],
        ])->assertSessionHasErrors('items');
        $this->assertSame(1, GradingPolicy::count());
        $this->assertTrue(BigDecimal::of((string) $item->fresh()->maximum_score)->isEqualTo('10'));

        $this->as($this->officer)->post($this->desk, [
            'reason' => 'Weight-only amendment',
            'rounding' => 'half_even',
            'boundaries' => [['minimum' => '0', 'grade' => 'F']],
            'items' => [$base + ['maximum' => '10', 'weight' => '100']],
        ])->assertSessionHasNoErrors()->assertRedirect();
        $this->assertSame(2, GradingPolicy::count());
        $this->assertSame($exam->id, Examination::firstOrFail()->id);
        $this->assertSame(1, ExamSlot::where('exam_id', $exam->id)->count());
    }
}
