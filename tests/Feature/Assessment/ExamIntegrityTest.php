<?php

namespace Tests\Feature\Assessment;

use App\Enums\Assessment\IntegrityEvent;
use App\Enums\EnrolmentStatus;
use App\Models\AssessmentItem;
use App\Models\AuditLog;
use App\Models\Enrolment;
use App\Models\Examination;
use App\Models\ExaminationAttempt;
use Illuminate\Support\Str;
use Inertia\Testing\AssertableInertia as Page;

class ExamIntegrityTest extends AssessmentCase
{
    private function exam(): Examination
    {
        $this->setupItems(['exam']);
        $item = AssessmentItem::sole();
        $this->post("/assessment-items/$item->id/exam", [
            'opens_at' => now()->subHour(), 'closes_at' => now()->addHour(),
            'duration_seconds' => 600, 'max_attempts' => 1,
            'questions' => [['topic' => 'Lab', 'prompt' => 'Describe the sample.', 'kind' => 'essay', 'points' => 10]],
        ])->assertSessionHasNoErrors();

        return Examination::sole();
    }

    public function test_receipts_are_idempotent_after_coalescing_and_reauthorize_on_replay(): void
    {
        $exam = $this->exam();
        $this->post("/examinations/$exam->id/integrity", ['observe_visibility' => true])->assertRedirect();
        $owner = $this->member->student->user;
        $this->as($owner)->post("/examinations/$exam->id/start")->assertRedirect();
        $attempt = ExaminationAttempt::sole();
        $url = "/attempts/$attempt->id/visibility-signal";
        $first = ['observation_id' => (string) Str::uuid()];
        $second = ['observation_id' => (string) Str::uuid()];
        $this->postJson($url, ['observation_id' => 'private note'])->assertJsonValidationErrors('observation_id');
        $this->postJson($url, $first + ['answer' => 'ignored'])->assertNoContent();
        $this->postJson($url, $second)->assertNoContent();
        $this->travel(11)->seconds();
        $this->postJson($url, $first)->assertNoContent();
        $this->postJson($url, $second)->assertNoContent();
        $event = AuditLog::where('action', IntegrityEvent::PageHidden)->sole();
        $this->assertSame([], $event->details);
        $this->get("/attempts/$attempt->id")->assertInertia(fn (Page $p) => $p->missing('attempt.visibility_receipts'));
        $this->postJson($url, ['observation_id' => (string) Str::uuid()])->assertNoContent();
        $this->as($this->marker)->postJson($url, $first)->assertNotFound();
        $peer = Enrolment::factory()->create(['offering_id' => $this->offering->id])->student->user;
        $this->as($peer)->postJson($url, $first)->assertNotFound();
        $this->post("/examinations/$exam->id/start")->assertRedirect();
        $other = ExaminationAttempt::where('id', '!=', $attempt->id)->sole();
        $this->postJson("/attempts/$other->id/visibility-signal", $first)->assertNoContent();
        $this->assertSame([$first['observation_id']], $other->refresh()->visibility_receipts);
        $this->member->forceFill(['status' => EnrolmentStatus::Withdrawn])->save();
        $this->as($owner)->postJson($url, $first)->assertNotFound();
        $this->assertSame(2, AuditLog::where('action', IntegrityEvent::PageHidden)->where('attempt_id', $attempt->id)->count());
    }

    public function test_observation_requires_an_enabled_policy_and_an_unexpired_attempt(): void
    {
        $exam = $this->exam();
        $this->as($this->member->student->user)->post("/examinations/$exam->id/start")->assertRedirect();
        $attempt = ExaminationAttempt::sole();
        $url = "/attempts/$attempt->id/visibility-signal";
        $payload = ['observation_id' => (string) Str::uuid()];
        $this->postJson($url, $payload)->assertForbidden();
        $exam->forceFill(['security_policy' => ['observe_visibility' => true]])->save();
        $this->travelTo($attempt->expires_at);
        $this->postJson($url, $payload)->assertConflict();
        $this->assertNull($attempt->refresh()->visibility_receipts);
        $this->assertDatabaseMissing('audit_logs', ['action' => IntegrityEvent::PageHidden->value]);
    }

    public function test_full_receipt_budget_acknowledges_only_known_observations(): void
    {
        $exam = $this->exam();
        $this->post("/examinations/$exam->id/integrity", ['observe_visibility' => true])->assertRedirect();
        $this->as($this->member->student->user)->post("/examinations/$exam->id/start")->assertRedirect();
        $attempt = ExaminationAttempt::sole();
        $receipts = array_map(fn () => (string) Str::uuid(), range(1, 1000));
        $attempt->forceFill(['visibility_receipts' => $receipts])->save();
        $url = "/attempts/$attempt->id/visibility-signal";
        $this->postJson($url, ['observation_id' => $receipts[0]])->assertNoContent();
        $this->postJson($url, ['observation_id' => (string) Str::uuid()])->assertConflict();
        $this->assertSame($receipts, $attempt->refresh()->visibility_receipts);
        $this->assertDatabaseMissing('audit_logs', ['action' => IntegrityEvent::PageHidden->value]);
    }

    public function test_disclosed_signals_are_owner_scoped_bounded_and_reviewed_without_marking(): void
    {
        $exam = $this->exam();
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
