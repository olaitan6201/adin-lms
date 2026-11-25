<?php

namespace Tests\Feature\Assessment;

use App\Models\AssessmentItem;
use App\Models\Grade;
use App\Models\Gradebook;
use App\Models\GradeBoundary;
use App\Models\GradeInput;
use App\Models\GradingPolicy;
use App\Models\GradingPolicyItem;
use Brick\Math\BigDecimal;
use Illuminate\Support\Str;

class GradebookPolicyTest extends AssessmentCase
{
    public function test_officer_can_activate_a_scored_policy_without_a_teaching_allocation(): void
    {
        $this->as($this->officer)->post($this->desk, $this->policy([$this->scoredItem()]))
            ->assertSessionHasNoErrors()->assertRedirect();

        $book = Gradebook::where('offering_id', $this->offering->id)->firstOrFail();
        $policy = $book->policy;
        $this->assertSame($this->offering->id, $policy->offering_id);
        $this->assertSame(1, $policy->version);
        $this->assertSame($this->officer->id, $policy->created_by);
        $this->assertDatabaseCount('grading_policy_items', 1);
        $item = AssessmentItem::firstOrFail();
        $this->assertCount(2, $item->rubric['criteria']);
        $maximum = BigDecimal::zero();
        foreach ($item->rubric['criteria'] as $criterion) {
            $maximum = $maximum->plus((string) $criterion['levels'][1]['points']);
        }

        $this->assertTrue($maximum->isEqualTo('10'));
        $this->assertDatabaseHas('audit_logs', [
            'action' => 'gradebook.activate',
            'subject_key' => $book->id,
            'actor_id' => $this->officer->id,
        ]);
    }

    public function test_student_cannot_activate_a_policy(): void
    {
        $this->as($this->member->student->user)->post($this->desk, $this->policy([$this->manualItem()]))
            ->assertForbidden();
        $this->assertDatabaseCount('gradebooks', 0);
    }

    public function test_officer_amendment_appends_policy_and_preserves_existing_grade_evidence(): void
    {
        $this->setupItems(['manual']);
        $item = AssessmentItem::firstOrFail();
        $this->as($this->marker)->post("/assessment-items/$item->id/score", [
            'enrolment' => $this->member->id,
            'points' => '7.125',
            'reason' => 'Checked evidence',
        ])->assertRedirect();
        $book = Gradebook::firstOrFail();
        $this->as($this->marker)->post("/gradebooks/$book->id/compute/{$this->member->id}")->assertRedirect();
        $grade = Grade::firstOrFail();
        $before = $grade->only(['id', 'policy_id', 'revision', 'total_percent', 'grade']);
        $inputBefore = GradeInput::firstOrFail()->only(['score_id', 'maximum_score', 'applied_weight']);
        $oldPolicy = $book->policy;
        $oldBoundary = GradeBoundary::where('policy_id', $oldPolicy->id)->firstOrFail()
            ->only(['minimum_percent', 'grade']);
        $amendment = $this->policy([
            $this->manualItem(['id' => $item->id, 'weight' => '50']),
            $this->manualItem(['title' => 'Later assessment', 'weight' => '50']),
        ], 'half_even', [['minimum' => '0', 'grade' => 'F'], ['minimum' => '60', 'grade' => 'B']]);
        $amendment['reason'] = 'Approved later continuous assessment';

        $this->as($this->marker)->post($this->desk, $amendment)->assertForbidden();
        $this->assertSame(1, GradingPolicy::count());
        $this->as($this->officer)->post($this->desk, $amendment)->assertSessionHasNoErrors()->assertRedirect();

        $book->refresh();
        $this->assertNotSame($oldPolicy->id, $book->policy_id);
        $this->assertSame(2, $book->policy->version);
        $this->assertSame($oldPolicy->id, $book->policy->supersedes_id);
        $this->assertSame('half_even', $book->policy->rounding_rule->value);
        $this->assertSame($before, $grade->fresh()->only(array_keys($before)));
        $this->assertSame($inputBefore, GradeInput::firstOrFail()->only(array_keys($inputBefore)));
        $this->assertSame($oldBoundary, GradeBoundary::where('policy_id', $oldPolicy->id)->firstOrFail()
            ->only(array_keys($oldBoundary)));
        $this->assertSame(2, AssessmentItem::where('gradebook_id', $book->id)->count());
        $this->assertSame(1, GradingPolicyItem::where('policy_id', $oldPolicy->id)->count());
        $this->assertSame(2, GradingPolicyItem::where('policy_id', $book->policy_id)->count());
        $this->assertDatabaseHas('audit_logs', [
            'action' => 'gradebook.amend',
            'subject_key' => $book->id,
            'actor_id' => $this->officer->id,
        ]);
    }

    public function test_amendment_rejects_missing_reason_omitted_items_kind_changes_and_unknown_ids(): void
    {
        $this->setupItems(['manual']);
        $item = AssessmentItem::firstOrFail();
        $base = $this->policy([$this->manualItem(['id' => $item->id])]);
        $cases = [
            ['reason' => ''] + $base,
            ['reason' => 'Change'] + $this->policy([$this->manualItem(['title' => 'Replacement'])]),
            ['reason' => 'Change'] + $this->policy([$this->manualItem(['id' => $item->id, 'kind' => 'attendance'])]),
            ['reason' => 'Change'] + $this->policy([$this->manualItem(['id' => (string) Str::uuid7()])]),
        ];
        foreach ($cases as $data) {
            $this->as($this->officer)->post($this->desk, $data)->assertSessionHasErrors();
            $this->assertSame(1, GradingPolicy::count());
            $this->assertSame(1, AssessmentItem::count());
        }
    }

    public function test_amendment_cannot_change_a_scored_maximum(): void
    {
        $this->setupItems(['manual']);
        $item = AssessmentItem::firstOrFail();
        $this->as($this->marker)->post("/assessment-items/$item->id/score", [
            'enrolment' => $this->member->id,
            'points' => '8',
            'reason' => 'Checked evidence',
        ])->assertRedirect();
        foreach (['7', '11'] as $maximum) {
            $this->as($this->officer)->post($this->desk, [
                'reason' => 'Change maximum',
            ] + $this->policy([$this->manualItem(['id' => $item->id, 'maximum' => $maximum])]))
                ->assertSessionHasErrors('items');
            $this->assertTrue(BigDecimal::of((string) $item->fresh()->maximum_score)->isEqualTo('10'));
            $this->assertSame(1, GradingPolicy::count());
        }
    }

    public function test_scored_rubric_rejects_inconsistent_maxima(): void
    {
        $item = $this->scoredItem();
        $item['criteria'][1]['levels'][1]['points'] = '5';
        $this->as($this->officer)->post($this->desk, $this->policy([$item]))
            ->assertSessionHasErrors('items');
        $this->assertDatabaseCount('gradebooks', 0);
    }

    private function policy(array $items, string $rounding = 'half_up', array $boundaries = []): array
    {
        return [
            'rounding' => $rounding,
            'boundaries' => $boundaries ?: [['minimum' => '0', 'grade' => 'F'], ['minimum' => '70', 'grade' => 'A']],
            'items' => $items,
        ];
    }

    private function manualItem(array $overrides = []): array
    {
        return $overrides + [
            'title' => 'Manual mark',
            'kind' => 'manual',
            'weight' => '100',
            'maximum' => '10',
        ];
    }

    private function scoredItem(): array
    {
        return [
            'title' => 'Essay',
            'kind' => 'assignment',
            'weight' => '100',
            'maximum' => '10',
            'criteria' => [
                ['title' => 'Argument', 'levels' => [
                    ['label' => 'Missing', 'points' => '0'],
                    ['label' => 'Complete', 'points' => '4'],
                ]],
                ['title' => 'Evidence', 'levels' => [
                    ['label' => 'Missing', 'points' => '0'],
                    ['label' => 'Complete', 'points' => '6'],
                ]],
            ],
        ];
    }
}
