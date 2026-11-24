<?php

namespace App\Services\Assessment;

use App\Models\AssessmentItem;
use App\Models\AssessmentScore;
use App\Models\AuditLog;
use App\Models\Enrolment;
use Brick\Math\BigDecimal;

class ScoreLedger
{
    /** Caller owns the transaction. */
    public function append(AssessmentItem $item, string $enrolment, string $points, string $reason, ?string $actor, array $evidence = []): AssessmentScore
    {
        Enrolment::where('offering_id', $item->gradebook->offering_id)->lockForUpdate()->findOrFail($enrolment);
        abort_if(BigDecimal::of($points)->isNegative() || BigDecimal::of($points)->isGreaterThan((string) $item->maximum_score), 422, 'Points outside item range.');
        $revision = 1 + AssessmentScore::where('item_id', $item->id)->where('enrolment_id', $enrolment)->max('revision');
        $score = AssessmentScore::forceCreate(['item_id' => $item->id, 'enrolment_id' => $enrolment, 'revision' => $revision, 'points' => $points, 'reason' => $reason, 'changed_by' => $actor, 'changed_at' => now()] + $evidence);
        $this->audit('score.recorded', $score->id, $actor, ['revision' => $revision, 'reason' => $reason, 'released' => isset($evidence['released_at'])]);

        return $score;
    }

    public function audit(string $action, string $subject, ?string $actor, array $details = [], ?string $attempt = null): void
    {
        AuditLog::forceCreate(['action' => $action, 'subject_key' => $subject, 'actor_id' => $actor, 'occurred_at' => now(), 'details' => $details, 'attempt_id' => $attempt]);
    }
}
