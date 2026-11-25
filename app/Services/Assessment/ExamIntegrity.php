<?php

namespace App\Services\Assessment;

use App\Enums\Assessment\IntegrityEvent;
use App\Models\AuditLog;
use App\Models\Examination;
use App\Models\ExaminationAttempt;
use App\Models\User;
use Illuminate\Support\Facades\DB;

final class ExamIntegrity
{
    public function configure(Examination $exam, User $actor, bool $observe, bool $preventCopy): void
    {
        DB::transaction(function () use ($exam, $actor, $observe, $preventCopy) {
            $exam = Examination::lockForUpdate()->findOrFail($exam->id);
            abort_if(ExaminationAttempt::where('exam_id', $exam->id)->exists(), 409, 'Candidates have already started.');
            $policy = ['observe_visibility' => $observe, 'prevent_copy' => $preventCopy];
            $exam->forceFill(['security_policy' => array_merge($exam->security_policy ?? [], $policy)])->save();
            $this->event(IntegrityEvent::PolicySet, $actor, $exam->id, null, $policy);
        });
    }

    public function signal(ExaminationAttempt $attempt, User $actor, ExamSession $sessions): void
    {
        DB::transaction(function () use ($attempt, $actor, $sessions) {
            $attempt = ExaminationAttempt::lockForUpdate()->findOrFail($attempt->id);
            $sessions->authorize($actor, $attempt);
            abort_unless($attempt->exam->security_policy['observe_visibility'] ?? false, 403);
            abort_if($attempt->submitted_at || now()->gte($attempt->expires_at), 409);
            $signals = AuditLog::where('attempt_id', $attempt->id)->where('action', IntegrityEvent::PageHidden);
            if ((clone $signals)->where('occurred_at', '>', now()->subSeconds(10))->exists() || $signals->count() >= 100) {
                return;
            }

            $this->event(IntegrityEvent::PageHidden, $actor, $attempt->exam_id, $attempt->id);
        });
    }

    public function review(Examination $exam, AuditLog $signal, User $actor, string $note): void
    {
        DB::transaction(function () use ($exam, $signal, $actor, $note) {
            $signal = AuditLog::where('subject_key', $exam->id)->where('action', IntegrityEvent::PageHidden)
                ->lockForUpdate()->findOrFail($signal->id);
            abort_if(AuditLog::where('subject_key', $signal->id)->where('action', IntegrityEvent::Reviewed)->exists(), 409);
            $this->event(IntegrityEvent::Reviewed, $actor, $signal->id, $signal->attempt_id, ['note' => $note]);
        });
    }

    private function event(IntegrityEvent $event, User $actor, string $subject, ?string $attempt, array $details = []): void
    {
        AuditLog::forceCreate([
            'action' => $event->value,
            'actor_id' => $actor->id,
            'subject_key' => $subject,
            'attempt_id' => $attempt,
            'occurred_at' => now(),
            'details' => $details,
        ]);
    }
}
