<?php

namespace App\Services\Academics;

use App\Enums\DeliveryLinkEvidenceStatus;
use Illuminate\Support\Str;

final class DeliveryLinkAttestation
{
    public const MAX_LENGTH = 191;

    /** SQLite/MySQL use whole seconds; PostgreSQL ISO output adds a numeric offset and may include microseconds. */
    private const STORED_TIMESTAMP = '/\A([0-9]{4})-([0-9]{2})-([0-9]{2}) (?:[01][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]'
        .'(?:(?:\.[0-9]{1,6})?[+-](?:0[0-9]|1[0-5])(?::[0-5][0-9](?::[0-5][0-9])?)?)?\z/';

    public static function valid(?string $note): bool
    {
        return $note !== null
            && mb_check_encoding($note, 'UTF-8')
            && ! str_contains($note, "\0")
            && Str::trim($note) !== ''
            && Str::length($note) <= self::MAX_LENGTH;
    }

    public static function status(?string $actorId, ?string $note, ?string $recordedAt): DeliveryLinkEvidenceStatus
    {
        if ($actorId === null && $note === null && $recordedAt === null) {
            return DeliveryLinkEvidenceStatus::Unconfirmed;
        }

        if ($actorId === null || ! self::valid($note) || ! self::hasRecordedInstant($recordedAt)) {
            return DeliveryLinkEvidenceStatus::Blocked;
        }

        return DeliveryLinkEvidenceStatus::Confirmed;
    }

    private static function hasRecordedInstant(?string $recordedAt): bool
    {
        if ($recordedAt === null || preg_match(self::STORED_TIMESTAMP, $recordedAt, $parts) !== 1) {
            return false;
        }

        return checkdate((int) $parts[2], (int) $parts[3], (int) $parts[1]);
    }
}
