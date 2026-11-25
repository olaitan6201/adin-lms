<?php

namespace App\Services\Operations;

use App\Enums\OperationsEvent;
use App\Enums\PrivacyCaseKind;
use App\Enums\PrivacyCaseStage;
use App\Enums\PrivacyOperation;
use App\Models\AuditLog;
use App\Models\PrivacyCaseFile;
use App\Models\PrivacyConsent;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

final class PrivacyCases
{
    public function __construct(private ConsentRegister $register) {}

    public function approve(User $operator, User $subject, PrivacyOperation $operation, string $reference): AuditLog
    {
        abort_if($operator->is($subject), 403);

        $details = ['operation' => $operation->value, 'reference' => $reference];
        if ($operation === PrivacyOperation::RegistrationExtract) {
            $this->requireVerifiedCase($subject, $reference);
        }

        if ($operation === PrivacyOperation::Purge) {
            $days = $this->register->days();
            abort_if($days === null, 409, 'No retention period configured.');
            $details['days'] = $days;
        }

        return OperationsAudit::record($operator, OperationsEvent::PrivacyApproved, $subject->id, $details);
    }

    /** @return array<string,mixed> */
    public function execute(User $operator, User $subject, string $approvalId, string $reference): array
    {
        return DB::transaction(function () use ($operator, $subject, $approvalId, $reference): array {
            $approval = $this->lockExecutableApproval($operator, $subject, $approvalId);
            if (($approval->details['reference'] ?? null) !== $reference) {
                throw ValidationException::withMessages(['reference' => 'Enter the case reference recorded on this approval receipt.']);
            }

            $value = $approval->details['operation'] ?? null;
            $operation = is_string($value) ? PrivacyOperation::tryFrom($value) : null;
            abort_if($operation === null, 409, 'Unrecognised privacy approval.');

            $lockedSubject = User::whereKey($subject->id)->lockForUpdate()->firstOrFail();
            $result = match ($operation) {
                PrivacyOperation::Export => $this->exportAccount($lockedSubject),
                PrivacyOperation::RegistrationExtract => $this->registrationExtract($lockedSubject, $approval),
                PrivacyOperation::Purge => $this->purgeExpiredConsents($lockedSubject, $approval),
            };

            OperationsAudit::record($operator, OperationsEvent::PrivacyExecuted, $approvalId, ['operation' => $operation->value]);

            return $result;
        });
    }

    private function lockExecutableApproval(User $operator, User $subject, string $approvalId): AuditLog
    {
        $approval = AuditLog::whereKey($approvalId)
            ->where('action', OperationsEvent::PrivacyApproved->value)
            ->where('subject_key', $subject->id)
            ->lockForUpdate()
            ->firstOrFail();

        abort_if($operator->id === $approval->actor_id || $operator->is($subject), 403);
        abort_if($approval->occurred_at->lt(now()->subDay()), 409, 'Approval expired.');

        $used = AuditLog::where('subject_key', $approvalId)
            ->where('action', OperationsEvent::PrivacyExecuted->value)
            ->exists();
        abort_if($used, 409, 'Already executed.');

        return $approval;
    }

    /** @return array<string,mixed> */
    private function exportAccount(User $subject): array
    {
        return [
            'account' => $subject->only(['id', 'full_name', 'email', 'status']),
            'consents' => PrivacyConsent::where('user_id', $subject->id)
                ->orderBy('granted_at')
                ->get(['purpose', 'notice_version', 'granted_at', 'withdrawn_at']),
        ];
    }

    private function requireVerifiedCase(User $subject, string $reference): void
    {
        $verified = PrivacyCaseFile::where('reference', $reference)->where('subject_id', $subject->id)
            ->where('kind', PrivacyCaseKind::Access)->where('stage', PrivacyCaseStage::Verified)->exists();
        abort_unless($verified, 409, 'A verified subject-access case is required.');
    }

    /** @return array<string,mixed> */
    private function registrationExtract(User $subject, AuditLog $approval): array
    {
        $this->requireVerifiedCase($subject, $approval->details['reference']);

        return ['registrations' => DB::table('students')->join('enrolments', 'enrolments.student_id', '=', 'students.id')
            ->join('offerings', 'offerings.id', '=', 'enrolments.offering_id')
            ->where('students.user_id', $subject->id)->orderBy('enrolments.id')
            ->get(['students.external_student_id', 'offerings.external_offering_id', 'enrolments.status',
                'enrolments.enrolled_at', 'enrolments.completed_at'])];
    }

    /** @return array{deleted:int} */
    private function purgeExpiredConsents(User $subject, AuditLog $approval): array
    {
        $hold = PrivacyCaseFile::where('subject_id', $subject->id)->where('kind', PrivacyCaseKind::Hold)
            ->where('stage', PrivacyCaseStage::Open)->lockForUpdate()->first();
        abort_if($hold !== null, 409, 'A retention hold prevents deletion.');
        $days = $this->register->days();
        abort_if($days === null || $days !== ($approval->details['days'] ?? null), 409, 'Retention period changed. Renew approval.');

        $deleted = PrivacyConsent::where('user_id', $subject->id)
            ->where('purpose', ConsentRegister::PURPOSE)
            ->where('withdrawn_at', '<=', $approval->occurred_at->subDays($days))
            ->delete();

        return ['deleted' => $deleted];
    }
}
