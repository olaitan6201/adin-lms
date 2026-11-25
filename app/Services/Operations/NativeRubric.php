<?php

namespace App\Services\Operations;

use Brick\Math\BigDecimal;
use Illuminate\Support\Str;

final class NativeRubric
{
    public static function portable(?array $rubric): ?array
    {
        if (! isset($rubric['criteria'])) {
            return $rubric;
        }
        NativeRules::rows($rubric['criteria'], 50, 1);
        foreach ($rubric['criteria'] as &$criterion) {
            NativeRules::fields($criterion, ['id', 'title', 'description', 'levels']);
            unset($criterion['id']);
            NativeRules::rows($criterion['levels'], 20, 2);
            foreach ($criterion['levels'] as &$level) {
                NativeRules::fields($level, ['id', 'label', 'points', 'description']);
                unset($level['id']);
            }
        }

        return $rubric;
    }

    public static function validate(mixed $rubric, string $kind, BigDecimal $maximum): void
    {
        if ($rubric === null) {
            return;
        }
        $scored = isset($rubric['criteria']);
        NativeRules::fields($rubric, $scored ? ['guide', 'criteria'] : ['guide']);
        self::description($rubric['guide'], false);
        if (! $scored) {
            return;
        }
        NativeRules::check($kind === 'assignment');
        NativeRules::rows($rubric['criteria'], 50, 1);
        $sum = BigDecimal::zero();
        foreach ($rubric['criteria'] as $criterion) {
            NativeRules::fields($criterion, ['title', 'description', 'levels']);
            NativeRules::string($criterion['title'], 191);
            self::description($criterion['description']);
            NativeRules::rows($criterion['levels'], 20, 2);
            $highest = BigDecimal::zero();
            foreach ($criterion['levels'] as $level) {
                NativeRules::fields($level, ['label', 'points', 'description']);
                NativeRules::string($level['label'], 191);
                self::description($level['description']);
                $points = NativeRules::number($level['points'], 1000000, false);
                if ($points->isGreaterThan($highest)) {
                    $highest = $points;
                }
            }
            $sum = $sum->plus($highest);
        }
        NativeRules::check($sum->isEqualTo($maximum), 'Rubric maxima must equal the assignment maximum.');
    }

    private static function description(mixed $text, bool $nullable = true): void
    {
        NativeRules::check(($nullable && $text === null) || (is_string($text) && mb_strlen($text) <= 10000 && ! str_contains($text, "\0")));
    }

    public static function restore(?array $rubric): ?array
    {
        if (isset($rubric['criteria'])) {
            foreach ($rubric['criteria'] as &$criterion) {
                $criterion['id'] = (string) Str::uuid7();
                foreach ($criterion['levels'] as &$level) {
                    $level['id'] = (string) Str::uuid7();
                }
            }
        }

        return $rubric;
    }
}
