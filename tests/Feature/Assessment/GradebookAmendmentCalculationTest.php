<?php

namespace Tests\Feature\Assessment;

use App\Models\AssessmentItem;
use App\Models\AssessmentScore;
use App\Models\Grade;
use App\Models\Gradebook;
use App\Models\GradeInput;
use Brick\Math\BigDecimal;

class GradebookAmendmentCalculationTest extends AssessmentCase
{
    public function test_weight_amendment_reuses_marks_and_freezes_new_applied_weights(): void
    {
        $this->setupItems(['manual', 'attendance']);
        $items = AssessmentItem::orderBy('id')->get();
        foreach ([['7.125', '60'], ['7.875', '40']] as $index => [$points, $weight]) {
            $item = $items[$index];
            $this->as($this->marker)->post("/assessment-items/$item->id/score", [
                'enrolment' => $this->member->id,
                'points' => $points,
                'reason' => 'Checked evidence',
            ])->assertRedirect();
        }
        $book = Gradebook::firstOrFail();
        $compute = "/gradebooks/$book->id/compute/{$this->member->id}";
        $this->as($this->marker)->post($compute)->assertRedirect();
        $original = Grade::firstOrFail();
        $before = $original->only(['id', 'policy_id', 'total_percent', 'grade']);

        $this->as($this->officer)->post($this->desk, [
            'reason' => 'Approved continuous assessment rebalance',
            'rounding' => 'half_even',
            'boundaries' => [['minimum' => '0', 'grade' => 'F'], ['minimum' => '70', 'grade' => 'A']],
            'items' => $items->map(fn (AssessmentItem $item, int $index): array => [
                'id' => $item->id,
                'title' => $item->title,
                'kind' => $item->kind->value,
                'maximum' => (string) $item->maximum_score,
                'weight' => $index === 0 ? '60' : '40',
            ])->all(),
        ])->assertSessionHasNoErrors()->assertRedirect();
        $this->as($this->marker)->post($compute)->assertRedirect();

        $revised = Grade::where('revision', 2)->firstOrFail();
        $this->assertNotSame($original->policy_id, $revised->policy_id);
        $this->assertTrue(BigDecimal::of((string) $revised->total_percent)->isEqualTo('74.25'));
        $this->assertSame('A', $revised->grade);
        $this->assertSame(2, AssessmentScore::count());
        $this->assertSame($before, $original->fresh()->only(array_keys($before)));
        $weights = GradeInput::where('grade_id', $revised->id)->orderBy('id')->pluck('applied_weight')
            ->map(fn ($weight): string => (string) BigDecimal::of((string) $weight)->strippedOfTrailingZeros());
        $this->assertSame(['60', '40'], $weights->all());
    }
}
