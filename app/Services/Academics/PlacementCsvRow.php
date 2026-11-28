<?php

namespace App\Services\Academics;

final readonly class PlacementCsvRow
{
    public const MAX_UPDATE_NUMBER = 999_999_999;

    public function __construct(
        public string $registrationId,
        public int $updateNumber,
        public string $studentId,
        public string $pathwayId,
        public string $sessionId,
        public string $cohortId,
        public string $programmeLevelId,
        public string $effectiveOn,
    ) {}

    public static function validUpdateNumber(int $number): bool
    {
        return $number >= 1 && $number <= self::MAX_UPDATE_NUMBER;
    }

    public function hasCalendarDate(): bool
    {
        return preg_match('/\A([0-9]{4})-([0-9]{2})-([0-9]{2})\z/', $this->effectiveOn, $date) === 1
            && checkdate((int) $date[2], (int) $date[3], (int) $date[1]);
    }
}
