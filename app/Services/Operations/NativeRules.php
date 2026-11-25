<?php

namespace App\Services\Operations;

use Brick\Math\BigDecimal;

final class NativeRules
{
    public static function check(bool $condition, string $message = 'Invalid or unsupported assessment definition.'): void
    {
        if (! $condition) {
            TextAssetArchive::reject($message);
        }
    }

    public static function fields(mixed $row, array $keys): void
    {
        self::check(is_array($row) && count($row) === count($keys) && ! array_diff($keys, array_keys($row)));
    }

    public static function rows(mixed $rows, int $max, int $min = 0): void
    {
        self::check(is_array($rows) && array_is_list($rows) && count($rows) >= $min && count($rows) <= $max);
    }

    public static function string(mixed $value, int $max): void
    {
        self::check(is_string($value) && trim($value) !== '' && mb_strlen($value) <= $max && ! str_contains($value, "\0"));
    }

    public static function number(mixed $value, int $maximum, bool $positive = true): BigDecimal
    {
        self::check(is_string($value) && (bool) preg_match('/^(?:0|[1-9]\d{0,6})(?:\.\d{1,8})?$/D', $value));
        $number = BigDecimal::of($value);
        self::check($number->isLessThanOrEqualTo($maximum) && (! $positive || $number->isPositive()));

        return $number;
    }

    public static function stamp(mixed $value): void
    {
        self::check(is_string($value));
        $date = \DateTimeImmutable::createFromFormat('!Y-m-d\TH:i:s\Z', $value, new \DateTimeZone('UTC'));
        self::check($date && $date->format('Y-m-d\TH:i:s\Z') === $value && $date->format('Y') >= 1970 && $date->format('Y') <= 2037,
            'Assessment windows must contain portable UTC dates (1970–2037).');
    }
}
