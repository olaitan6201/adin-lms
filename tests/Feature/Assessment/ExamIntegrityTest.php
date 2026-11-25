<?php

namespace Tests\Feature\Assessment;

use App\Enums\Assessment\IntegrityEvent;
use App\Models\AssessmentItem;
use App\Models\AuditLog;
use App\Models\Enrolment;
use App\Models\Examination;
use App\Models\ExaminationAttempt;
use Inertia\Testing\AssertableInertia as Page;

class ExamIntegrityTest extends AssessmentCase
{
    public function test_disclosed_signals_are_owner_scoped_bounded_and_reviewed_without_marking(): void
    {
        $this->setupItems(['exam']);
        $item = AssessmentItem::sole();
        $this->post("/assessment-items/$item->id/exam", [
            'opens_at' => now()->subHour(), 'closes_at' => now()->addHour(),
            'duration_seconds' => 600, 'max_attempts' => 1,
            'questions' => [['topic' => 'Lab', 'prompt' => 'Describe the sample.', 'kind' => 'essay', 'points' => 10]],
        ])->assertSessionHasNoErrors();
        $exam = Examination::sole();
        $url = "/examinations/$exam->id/integrity";
        $policy = ['observe_visibility' => 1, 'prevent_copy' => 1];
        $this->post($url, $policy)->assertRedirect();
        $this->as($this->member->student->user)->get($url)->assertForbidden();
        $this->post($url, [])->assertForbidden();
        $this->post("/examinations/$exam->id/start")->assertRedirect();
        $attempt = ExaminationAttempt::sole();
        $paper = "/attempts/$attempt->id";
        $this->get($paper)->assertInertia(fn (Page $p) => $p->where('integrity.observe_visibility', true)
            ->where('integrity.prevent_copy', true)->missing('signals'));
        $this->postJson("$paper/visibility-signal")->assertNoContent();
        $this->postJson("$paper/visibility-signal")->assertNoContent();
        $signal = AuditLog::where('action', IntegrityEvent::PageHidden)->sole();
        $this->as(Enrolment::factory()->create()->student->user)->postJson("$paper/visibility-signal")->assertNotFound();
        $this->as($this->marker)->post($url, [])->assertConflict();
        $this->get($url)->assertInertia(fn (Page $p) => $p->has('signals.data', 1)->where('locked', true));
        $review = "$url/signals/$signal->id/review";
        $this->post($review, ['note' => 'The learner used an accessibility tool. No action needed.'])->assertRedirect();
        $this->post($review, ['note' => 'Overwrite'])->assertConflict();
        $this->get($url)->assertInertia(fn (Page $p) => $p->where('signals.data.0.reviewer', $this->marker->full_name));
        $this->assertDatabaseCount('assessment_scores', 0);
        $this->as($this->member->student->user)->post("$paper/finish")->assertRedirect();
        $this->postJson("$paper/visibility-signal")->assertConflict();
    }
}
