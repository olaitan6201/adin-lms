<?php

namespace App\Services\Operations;

use App\Models\AuditLog;
use App\Models\PrivacyConsent;
use App\Models\User;
use Illuminate\Support\Facades\DB;

final class PrivacyCases
{
    public function __construct(private ConsentRegister $register) {}

    public function approve(User $operator, User $subject, string $operation, string $reference): AuditLog
    {
        abort_if($operator->is($subject), 403);

        $details = ['operation' => $operation, 'reference' => $reference];
        if ($operation === 'purge') {
            $days = $this->register->days();
            abort_if($days === null, 409, 'No retention period configured.');
            $details['days'] = $days;
        }

        return OperationsAudit::record($operator, 'privacy.approved', $subject->id, $details);
    }

    /** @return array<string,mixed> */
    public function execute(User $operator, User $subject, string $approvalId): array
    {
        return DB::transaction(function () use ($operator, $subject, $approvalId): array {
            $approval = AuditLog::whereKey($approvalId)->where('action', 'privacy.approved')
                ->where('subject_key', $subject->id)->lockForUpdate()->firstOrFail();
            abort_if($operator->id === $approval->actor_id || $operator->is($subject), 403);
            abort_if($approval->occurred_at->lt(now()->subDay()), 409, 'Approval expired.');
            abort_if(AuditLog::where('subject_key', $approvalId)->where('action', 'privacy.executed')->exists(), 409, 'Already executed.');
            User::whereKey($subject->id)->lockForUpdate()->firstOrFail();
            $consents = PrivacyConsent::where('user_id', $subject->id);
            if ($approval->details['operation'] === 'export') {
                $result = ['account' => $subject->only(['id', 'full_name', 'email', 'status']),
                    'consents' => $consents->orderBy('granted_at')->get(['purpose', 'notice_version', 'granted_at', 'withdrawn_at'])];
            } else {
                $days = $this->register->days();
                abort_if($days === null || $days !== $approval->details['days'], 409, 'Retention period changed. Renew approval.');
                $result = ['deleted' => $consents->where('purpose', ConsentRegister::PURPOSE)
                    ->where('withdrawn_at', '<=', $approval->occurred_at->subDays($days))->delete()];
            }
            OperationsAudit::record($operator, 'privacy.executed', $approvalId, ['operation' => $approval->details['operation']]);

            return $result;
        });
    }
}
