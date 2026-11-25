<?php

namespace Tests\Feature\Assessment;

use App\Models\AssessmentCriterionFeedback;
use App\Models\AssessmentScore;
use Brick\Math\BigDecimal;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use LogicException;

class AssignmentRubricMarkingTest extends ScoredAssignmentCase
{
    public function test_scored_marks_derive_points_and_append_immutable_criterion_feedback(): void
    {
        Storage::fake('local');
        ['version' => $version, 'rubric' => $rubric] = $this->scoredAssignment();
        $url = "/submission-versions/$version->id/marks";
        $selections = $this->selections($rubric);
        $this->as($this->member->student->user)->post($url, [
            'reason' => 'Unauthorised',
            'selections' => $selections,
        ])->assertForbidden();
        $this->assertDatabaseCount('assessment_scores', 0);

        $invalid = [
            ['reason' => 'Mixed mode', 'points' => '6', 'selections' => $selections],
            ['reason' => 'Incomplete', 'selections' => [$selections[0]]],
            ['reason' => 'Wrong level', 'selections' => [
                $selections[0],
                ['criterion' => $selections[1]['criterion'], 'level' => $selections[0]['level']],
            ]],
        ];
        foreach ($invalid as $data) {
            $this->as($this->marker)->post($url, $data + [
                'script' => UploadedFile::fake()->createWithContent('draft.txt', 'Must not be stored'),
            ])->assertSessionHasErrors();
            $this->assertDatabaseCount('assessment_scores', 0);
            $this->assertSame([], Storage::disk('local')->allFiles());
        }

        $this->as($this->marker)->post($url, [
            'reason' => 'Rubric applied',
            'feedback' => 'Good structure; improve sourcing.',
            'selections' => $selections,
            'script' => UploadedFile::fake()->createWithContent('marked.txt', 'Marker comments'),
        ])->assertSessionHasNoErrors()->assertRedirect();
        $score = AssessmentScore::firstOrFail();
        $this->assertTrue(BigDecimal::of((string) $score->points)->isEqualTo('6'));
        $this->assertSame('Good structure; improve sourcing.', $score->feedback);
        $this->assertNotNull($score->marked_file_id);
        $this->assertNull($score->released_at);
        $this->assertDatabaseCount('assessment_criterion_feedback', 2);
        $this->assertDatabaseHas('assessment_criterion_feedback', [
            'score_id' => $score->id,
            'criterion_title' => 'Argument',
            'level_label' => 'Complete',
            'points' => 4,
            'feedback' => 'Clear claim.',
        ]);
        $snapshot = AssessmentCriterionFeedback::where('score_id', $score->id)->orderBy('position')
            ->get()->toArray();
        try {
            AssessmentCriterionFeedback::firstOrFail()->forceFill(['feedback' => 'Rewritten'])->save();
            $this->fail('Criterion feedback was updated.');
        } catch (LogicException) {
            $this->assertSame($snapshot, AssessmentCriterionFeedback::where('score_id', $score->id)
                ->orderBy('position')->get()->toArray());
        }

        $this->as($this->marker)->post($url, [
            'reason' => 'Regrade after review',
            'selections' => $this->selections($rubric, evidence: 2),
        ])->assertSessionHasNoErrors()->assertRedirect();
        $revised = AssessmentScore::where('revision', 2)->firstOrFail();
        $this->assertTrue(BigDecimal::of((string) $revised->points)->isEqualTo('10'));
        $this->assertDatabaseCount('assessment_scores', 2);
        $this->assertDatabaseCount('assessment_criterion_feedback', 4);
        $this->assertSame($snapshot, AssessmentCriterionFeedback::where('score_id', $score->id)
            ->orderBy('position')->get()->toArray());
    }
}
