<?php

namespace App\Services\Roster;

use App\Enums\EnrolmentStatus;
use App\Enums\RosterAuditAction;
use App\Enums\RosterStartProvenance;
use App\Models\AuditLog;
use App\Models\Enrolment;
use Carbon\CarbonImmutable;
use Carbon\Exceptions\InvalidFormatException;
use DateTimeInterface;
use Illuminate\Database\Eloquent\Builder;
use stdClass;
use ValueError;

final class RegistrationInterval
{
    /**
     * The importer holds the student lock and commits this evidence with the source revision.
     *
     * @param  (object{status: string, enrolled_at: ?string, updated_at: ?string, created_at: ?string}&stdClass)|null  $previous
     */
    public static function observe(string $id, ?stdClass $previous, int $revision, DateTimeInterface $receivedAt): void
    {
        $start = $receivedAt;
        $provenance = $previous === null ? RosterStartProvenance::InitialImport : RosterStartProvenance::Reactivation;
        if ($previous?->status === EnrolmentStatus::Registered->value) {
            if (self::starts($id)->lockForUpdate()->first(['id']) !== null) {
                return;
            }

            // Keep the legacy notification cutoff without treating that fallback as original start evidence.
            $start = $previous->enrolled_at ?? $previous->updated_at ?? $previous->created_at ?? $receivedAt;
            $provenance = RosterStartProvenance::LegacyReaffirmation;
        }

        AuditLog::forceCreate([
            'subject_key' => $id,
            'action' => RosterAuditAction::RegistrationStarted->value,
            'occurred_at' => $start,
            'details' => [
                'source_revision' => $revision,
                'start_provenance' => $provenance->value,
                'observed_start_at' => $provenance === RosterStartProvenance::InitialImport
                    ? now()->toImmutable()->startOfSecond()->toAtomString()
                    : null,
            ],
        ]);
    }

    /** @param Builder<Enrolment> $registrations */
    public static function startedBy(Builder $registrations, CarbonImmutable $cutoff): void
    {
        $registrations->whereRaw(
            'coalesce((select max(occurred_at) from audit_logs where subject_key = cast(enrolments.id as char(36)) and action = ?),
                enrolled_at, updated_at, created_at) <= ?',
            [RosterAuditAction::RegistrationStarted->value, $cutoff],
        );
    }

    /** Read under the student's roster lock when deciding a durable link. */
    public static function firstImportedStart(Enrolment $enrolment): ?CarbonImmutable
    {
        $starts = self::starts($enrolment->id)->lockForUpdate()->limit(2)->get(['details']);
        $first = $starts->first();

        if ($starts->count() !== 1 || ($first?->details['start_provenance'] ?? null) !== RosterStartProvenance::InitialImport->value) {
            return null;
        }

        $observed = $first->details['observed_start_at'] ?? null;
        if (! is_string($observed)) {
            return null;
        }

        try {
            $time = CarbonImmutable::createFromFormat(DATE_ATOM, $observed);
        } catch (InvalidFormatException|ValueError) {
            return null;
        }

        return $time?->toAtomString() === $observed ? $time : null;
    }

    /** @return Builder<AuditLog> */
    private static function starts(string $enrolmentId): Builder
    {
        return AuditLog::where('subject_key', $enrolmentId)->where('action', RosterAuditAction::RegistrationStarted);
    }
}
