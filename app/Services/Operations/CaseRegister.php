<?php

namespace App\Services\Operations;

use App\Enums\OperationsEvent;
use App\Enums\PrivacyCaseKind;
use App\Enums\PrivacyCaseStage;
use App\Models\PrivacyCaseFile;
use App\Models\User;
use Illuminate\Support\Facades\DB;

final class CaseRegister
{
    public function open(User $actor, PrivacyCaseKind $kind, string $reference, ?string $subject): void
    {
        DB::transaction(function () use ($actor, $kind, $reference, $subject): void {
            if ($subject !== null) {
                User::whereKey($subject)->lockForUpdate()->firstOrFail();
            }

            $case = PrivacyCaseFile::forceCreate([
                'kind' => $kind, 'stage' => PrivacyCaseStage::Open, 'reference' => $reference, 'evidence' => $reference,
                'owner_id' => $actor->id, 'subject_id' => $subject,
            ]);
            $this->record($actor, $case);
        });
    }

    public function advance(User $actor, PrivacyCaseFile $case, PrivacyCaseStage $expected, string $reference): void
    {
        DB::transaction(function () use ($actor, $case, $expected, $reference): void {
            if ($case->subject_id !== null) {
                User::whereKey($case->subject_id)->lockForUpdate()->firstOrFail();
            }

            $case = PrivacyCaseFile::whereKey($case->id)->lockForUpdate()->firstOrFail();
            $next = $case->kind->next($case->stage);
            abort_if($case->stage !== $expected || $next === null, 409, 'Case has changed; refresh before continuing.');
            abort_if($case->kind === PrivacyCaseKind::Hold && $actor->id === $case->owner_id, 403, 'Another privacy officer must release the hold.');
            $case->forceFill(['stage' => $next, 'evidence' => $reference])->save();
            $this->record($actor, $case);
        });
    }

    private function record(User $actor, PrivacyCaseFile $case): void
    {
        OperationsAudit::record($actor, OperationsEvent::CaseAdvanced, $case->id, [
            'kind' => $case->kind->value, 'stage' => $case->stage->value, 'reference' => $case->evidence,
        ]);
    }
}
