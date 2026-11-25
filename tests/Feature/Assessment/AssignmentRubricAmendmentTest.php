<?php

namespace Tests\Feature\Assessment;

use App\Models\AssessmentCriterionFeedback;
use App\Models\AssessmentScore;
use App\Models\GradingPolicyItem;
use App\Models\SubmissionVersion;
use Brick\Math\BigDecimal;

class AssignmentRubricAmendmentTest extends ScoredAssignmentCase
{
    public function test_policy_amendment_does_not_rewrite_prior_criterion_feedback(): void
    {
        ['item' => $item, 'assignment' => $assignment, 'version' => $first, 'rubric' => $rubric] = $this->scoredAssignment();
        $this->as($this->marker)->post("/submission-versions/$first->id/marks", [
            'reason' => 'Original rubric',
            'selections' => $this->selections($rubric),
        ])->assertSessionHasNoErrors()->assertRedirect();
        $original = AssessmentScore::where('submission_version_id', $first->id)->firstOrFail();
        $originalFeedback = AssessmentCriterionFeedback::where('score_id', $original->id)->orderBy('position')->get();
        $originalPolicy = $item->gradebook->policy_id;

        $amendment = $this->scoredPolicy();
        $amendment['reason'] = 'Clarify performance levels for later revisions';
        $amendment['items'][0]['id'] = $item->id;
        $amendment['items'][0]['criteria'][0]['title'] = 'Revised argument';
        $amendment['items'][0]['criteria'][0]['levels'][1]['label'] = 'Strong claim';
        $amendment['items'][0]['criteria'][0]['levels'][1]['points'] = '5';
        $amendment['items'][0]['criteria'][1]['title'] = 'Revised evidence';
        $amendment['items'][0]['criteria'][1]['levels'] = [
            ['label' => 'Missing', 'points' => '0'],
            ['label' => 'Strong evidence', 'points' => '5'],
        ];
        $this->as($this->officer)->post($this->desk, $amendment)->assertSessionHasNoErrors()->assertRedirect();
        $currentRubric = $item->fresh()->rubric;
        $this->as($this->member->student->user)->post("/assignments/$assignment->id", [
            'body' => 'Revised work under the amended rubric.',
        ])->assertSessionHasNoErrors()->assertRedirect();
        $second = SubmissionVersion::where('submission_id', $first->submission_id)->where('revision', 2)->firstOrFail();
        $this->as($this->marker)->post("/submission-versions/$second->id/marks", [
            'reason' => 'Amended rubric',
            'selections' => $this->selections($currentRubric, evidence: 1),
        ])->assertSessionHasNoErrors()->assertRedirect();

        $revised = AssessmentScore::where('submission_version_id', $second->id)->firstOrFail();
        $this->assertTrue(BigDecimal::of((string) $revised->points)->isEqualTo('10'));
        $this->assertTrue(BigDecimal::of((string) $original->fresh()->points)->isEqualTo('6'));
        $this->assertSame(
            $originalFeedback->toArray(),
            AssessmentCriterionFeedback::where('score_id', $original->id)->orderBy('position')->get()->toArray(),
        );
        $this->assertDatabaseHas('assessment_criterion_feedback', [
            'score_id' => $revised->id,
            'criterion_title' => 'Revised argument',
            'level_label' => 'Strong claim',
        ]);
        $snapshot = GradingPolicyItem::where('policy_id', $originalPolicy)->firstOrFail();
        $this->assertSame('Argument', $snapshot->rubric['criteria'][0]['title']);
    }
}
