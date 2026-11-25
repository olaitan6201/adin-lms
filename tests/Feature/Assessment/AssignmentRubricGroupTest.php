<?php

namespace Tests\Feature\Assessment;

use App\Models\AssessmentCriterionFeedback;
use App\Models\AssessmentScore;
use App\Models\Enrolment;
use App\Models\GroupMember;
use App\Models\StudyGroup;
use Brick\Math\BigDecimal;

class AssignmentRubricGroupTest extends ScoredAssignmentCase
{
    public function test_one_rubric_decision_appends_feedback_for_every_frozen_recipient(): void
    {
        $group = StudyGroup::forceCreate(['offering_id' => $this->offering->id, 'name' => 'Evidence team']);
        $other = Enrolment::factory()->create(['offering_id' => $this->offering->id]);
        $outsider = Enrolment::factory()->create(['offering_id' => $this->offering->id]);
        foreach ([$this->member, $other] as $recipient) {
            GroupMember::forceCreate(['group_id' => $group->id, 'enrolment_id' => $recipient->id]);
        }
        ['version' => $version, 'rubric' => $rubric] = $this->scoredAssignment(true, $group);

        $this->as($this->marker)->post("/submission-versions/$version->id/marks", [
            'reason' => 'Group rubric applied',
            'selections' => $this->selections($rubric),
        ])->assertSessionHasNoErrors()->assertRedirect();

        $scores = AssessmentScore::where('submission_version_id', $version->id)->get();
        $this->assertCount(2, $scores);
        $this->assertEqualsCanonicalizing([$this->member->id, $other->id], $scores->pluck('enrolment_id')->all());
        $this->assertFalse($scores->contains('enrolment_id', $outsider->id));
        foreach ($scores as $score) {
            $this->assertTrue(BigDecimal::of((string) $score->points)->isEqualTo('6'));
            $this->assertSame(2, AssessmentCriterionFeedback::where('score_id', $score->id)->count());
        }
        $this->assertDatabaseCount('assessment_criterion_feedback', 4);
    }
}
