<?php

namespace App\Services\Operations;

use App\Enums\OperationsEvent;
use App\Models\AuditLog;
use App\Models\User;

final class OperationsAudit
{
    /** @param array<string,int|string> $details */
    public static function record(User $actor, OperationsEvent $action, string $subject, array $details = []): AuditLog
    {
        return AuditLog::forceCreate([
            'actor_id' => $actor->id,
            'action' => $action->value,
            'subject_key' => $subject,
            'occurred_at' => now(),
            'details' => $details,
        ]);
    }
}
