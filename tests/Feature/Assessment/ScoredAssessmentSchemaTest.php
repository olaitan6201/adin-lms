<?php

namespace Tests\Feature\Assessment;

use App\Models\AssessmentCriterionFeedback;
use App\Models\AssessmentItem;
use App\Models\AssessmentScore;
use App\Models\CurriculumCourse;
use App\Models\Enrolment;
use App\Models\Gradebook;
use App\Models\GradingPolicy;
use App\Models\GradingPolicyItem;
use App\Models\Offering;
use Illuminate\Foundation\Testing\RefreshDatabase;
use LogicException;
use Tests\TestCase;

class ScoredAssessmentSchemaTest extends TestCase
{
    use RefreshDatabase;

    public function test_policy_and_criterion_evidence_are_append_only(): void
    {
        $offering = Offering::factory()->create(['curriculum_course_id' => CurriculumCourse::factory()]);
        $policy = GradingPolicy::forceCreate([
            'name' => 'Scored policy',
            'version' => 1,
            'rounding_rule' => 'half_up',
            'offering_id' => $offering->id,
            'created_at' => now(),
        ]);
        $book = Gradebook::forceCreate(['offering_id' => $offering->id, 'policy_id' => $policy->id]);
        $item = AssessmentItem::forceCreate([
            'gradebook_id' => $book->id,
            'title' => 'Essay',
            'kind' => 'assignment',
            'weight_percent' => '100',
            'maximum_score' => '10',
            'rubric' => ['guide' => 'Use evidence'],
        ]);
        $snapshot = GradingPolicyItem::forceCreate([
            'policy_id' => $policy->id,
            'assessment_item_id' => $item->id,
            'position' => 0,
            'title' => $item->title,
            'kind' => $item->kind->value,
            'weight_percent' => '100',
            'maximum_score' => '10',
            'rubric' => $item->rubric,
        ]);
        $enrolment = Enrolment::factory()->create(['offering_id' => $offering->id]);
        $score = AssessmentScore::forceCreate([
            'item_id' => $item->id,
            'enrolment_id' => $enrolment->id,
            'revision' => 1,
            'points' => '7.5',
            'changed_at' => now(),
            'reason' => 'Rubric applied',
        ]);
        $feedback = AssessmentCriterionFeedback::forceCreate([
            'score_id' => $score->id,
            'criterion_key' => 'criterion-a',
            'criterion_title' => 'Argument',
            'level_key' => 'level-a',
            'level_label' => 'Complete',
            'points' => '7.5',
            'position' => 0,
        ]);

        try {
            $snapshot->forceFill(['title' => 'Changed'])->save();
            $this->fail('Policy snapshot was updated.');
        } catch (LogicException) {
            $this->assertSame('Essay', $snapshot->fresh()->title);
        }
        try {
            $feedback->forceFill(['points' => '10'])->save();
            $this->fail('Criterion feedback was updated.');
        } catch (LogicException) {
            $this->assertTrue($score->fresh()->points == '7.5');
        }
        $this->assertDatabaseCount('grading_policy_items', 1);
        $this->assertDatabaseCount('assessment_criterion_feedback', 1);
    }
}
