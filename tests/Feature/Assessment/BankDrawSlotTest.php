<?php

namespace Tests\Feature\Assessment;

use App\Models\AssessmentItem;
use App\Models\AttemptQuestion;
use App\Models\Examination;
use App\Models\QuestionBank;
use App\Models\QuestionVersion;

final class BankDrawSlotTest extends AssessmentCase
{
    public function test_two_papers_reuse_the_same_fixed_revision_and_draw_distinct_existing_questions(): void
    {
        $this->setupItems(['exam', 'exam']);
        $bankUrl = "/courses/{$this->offering->id}/question-banks";
        foreach (['Explain a queue', 'Explain a stack'] as $prompt) {
            $this->post($bankUrl, ['topic' => 'Algorithms', 'kind' => 'essay', 'prompt' => $prompt])->assertSessionHasNoErrors();
        }
        $bank = QuestionBank::sole();
        $fixed = QuestionVersion::where('prompt', 'Explain a queue')->sole();
        $data = [
            'opens_at' => now()->subHour(), 'closes_at' => now()->addHour(),
            'duration_seconds' => 600, 'max_attempts' => 1,
            'selections' => [['version_id' => $fixed->id, 'points' => 6]],
            'draws' => [['bank_id' => $bank->id, 'points' => 4]],
        ];
        foreach (AssessmentItem::all() as $item) {
            $this->as($this->marker)->post("/assessment-items/$item->id/exam", array_merge($data, [
                'draws' => [['bank_id' => $bank->id, 'points' => 2], ['bank_id' => $bank->id, 'points' => 2]],
            ]))->assertSessionHasErrors('draws');
            $this->post("/assessment-items/$item->id/exam", $data)->assertSessionHasNoErrors();
            $exam = Examination::where('item_id', $item->id)->sole();
            $this->as($this->member->student->user)->post("/examinations/$exam->id/start")->assertRedirect();
        }
        $this->assertSame(2, AttemptQuestion::where('version_id', $fixed->id)->where('position', 1)->count());
        $this->assertSame(2, AttemptQuestion::where('version_id', '!=', $fixed->id)->where('position', 2)->count());
        $this->assertDatabaseCount('question_versions', 2);
    }
}
