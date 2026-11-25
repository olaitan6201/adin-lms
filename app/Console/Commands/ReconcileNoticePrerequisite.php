<?php

namespace App\Console\Commands;

use App\Enums\CommunityAuditAction;
use App\Models\AuditLog;
use App\Models\Module;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

#[Signature('community:reconcile-rule {change} {previous : Prior lesson UUID or none} {microsecond : Verified fractional part of the edit time} {evidence : Backup or change-record reference}')]
#[Description('Append verified evidence for a legacy prerequisite edit before replaying release notices')]
class ReconcileNoticePrerequisite extends Command
{
    public function handle(): int
    {
        $id = $this->argument('change');
        $previous = $this->argument('previous');
        $fraction = $this->argument('microsecond');
        $evidence = trim($this->argument('evidence'));
        if (! Str::isUuid($id) || ($previous !== 'none' && ! Str::isUuid($previous))
            || ! preg_match('/^\d{1,6}$/D', $fraction) || $evidence === '' || strlen($evidence) > 191) {
            $this->error('Invalid change, prior lesson, microsecond (0–999999), or evidence reference.');

            return self::FAILURE;
        }

        return DB::transaction(function () use ($id, $previous, $fraction, $evidence): int {
            $change = AuditLog::where('action', CommunityAuditAction::LessonPrerequisiteChanged->value)->lockForUpdate()->find($id);
            if (! $change || $change->details !== null || AuditLog::where('subject_key', $id)
                ->where('action', CommunityAuditAction::PrerequisiteHistoryReconciled->value)->exists()) {
                $this->error('Unknown change or history already recorded.');

                return self::FAILURE;
            }
            $lesson = Module::findOrFail($change->subject_key);
            if ($previous !== 'none' && ($lesson->id === strtolower($previous) ||
                ! Module::whereOfferingId($lesson->offering_id)->whereKey($previous)->exists())) {
                $this->error('Prior lesson must be a different lesson in the same offering.');

                return self::FAILURE;
            }
            AuditLog::forceCreate([
                'action' => CommunityAuditAction::PrerequisiteHistoryReconciled->value,
                'subject_key' => $id,
                'occurred_at' => now(),
                'details' => ['previous' => $previous === 'none' ? null : strtolower($previous),
                    'microsecond' => (int) $fraction, 'evidence' => $evidence],
            ]);
            $this->info('Evidence recorded. Retry the affected release job.');

            return self::SUCCESS;
        });
    }
}
