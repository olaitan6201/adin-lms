<?php

namespace App\Services\Roster;

use App\Enums\EnrolmentStatus;
use App\Enums\RosterAuditAction;
use App\Models\AuditLog;
use Carbon\CarbonImmutable;
use DateTimeInterface;
use Illuminate\Database\Eloquent\Builder;

final class RegistrationInterval
{
    /** The importer holds the student lock and commits this evidence with the source revision. */
    public static function observe(string $id, ?object $previous, int $revision, DateTimeInterface $now): void
    {
        $start = $now;
        if ($previous?->status === EnrolmentStatus::Registered->value) {
            if (AuditLog::where('subject_key', $id)->where('action', RosterAuditAction::RegistrationStarted)->exists()) {
                return;
            }

            // Adopt the last evidence available on a legacy row before a reaffirmation overwrites it.
            $start = $previous->enrolled_at ?? $previous->updated_at ?? $previous->created_at ?? $now;
        }

        AuditLog::forceCreate([
            'subject_key' => $id,
            'action' => RosterAuditAction::RegistrationStarted->value,
            'occurred_at' => $start,
            'details' => ['source_revision' => $revision],
        ]);
    }

    public static function startedBy(Builder $registrations, CarbonImmutable $cutoff): void
    {
        $registrations->whereRaw(
            'coalesce((select max(occurred_at) from audit_logs where subject_key = cast(enrolments.id as char(36)) and action = ?),
                enrolled_at, updated_at, created_at) <= ?',
            [RosterAuditAction::RegistrationStarted->value, $cutoff],
        );
    }
}
