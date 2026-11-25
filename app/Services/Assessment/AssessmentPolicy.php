<?php

namespace App\Services\Assessment;

use App\Enums\Assessment\ItemKind;
use App\Enums\Assessment\RoundingRule;
use Brick\Math\BigDecimal;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

final class AssessmentPolicy
{
    public const MAX_CRITERIA = 50;

    public const MAX_LEVELS = 20;

    public static function normalize(array $data): array
    {
        $rounding = RoundingRule::tryFrom((string) ($data['rounding'] ?? ''));
        if ($rounding === null || $rounding === RoundingRule::None) {
            throw ValidationException::withMessages(['rounding' => 'A rounding policy is required.']);
        }
        $weights = BigDecimal::zero();
        $items = [];
        foreach ($data['items'] ?? [] as $row) {
            $kind = ItemKind::tryFrom((string) ($row['kind'] ?? ''));
            if ($kind === null) {
                throw ValidationException::withMessages(['items' => 'Unknown assessment kind.']);
            }
            $weights = $weights->plus((string) $row['weight']);
            $items[] = [
                'id' => $row['id'] ?? null,
                'title' => (string) $row['title'],
                'kind' => $kind,
                'weight_percent' => (string) $row['weight'],
                'maximum_score' => (string) $row['maximum'],
                'rubric' => self::rubric($row, $kind),
            ];
        }
        if ($items === [] || ! $weights->isEqualTo(100)) {
            throw ValidationException::withMessages(['items' => 'Item weights must total 100%.']);
        }
        $boundaries = self::boundaries($data['boundaries'] ?? []);

        return compact('rounding', 'boundaries', 'items');
    }

    public static function rubric(array $row, ItemKind $kind): array
    {
        $guide = trim((string) ($row['rubric'] ?? ''));
        $criteria = $row['criteria'] ?? [];
        if ($criteria === []) {
            return ['guide' => $guide];
        }
        if ($kind !== ItemKind::Assignment) {
            throw ValidationException::withMessages(['items' => 'Scored rubrics are supported only for assignments.']);
        }

        $maximum = BigDecimal::of((string) $row['maximum']);
        $total = BigDecimal::zero();
        $normalized = [];
        foreach ($criteria as $criterion) {
            $levels = [];
            $criterionMaximum = BigDecimal::zero();
            foreach ($criterion['levels'] ?? [] as $level) {
                $points = BigDecimal::of((string) $level['points']);
                if ($points->isNegative() || $points->isGreaterThan($maximum)) {
                    throw ValidationException::withMessages(['items' => 'Level points exceed the item maximum.']);
                }
                if ($criterionMaximum->isLessThan($points)) {
                    $criterionMaximum = $points;
                }
                $levels[] = [
                    'id' => (string) Str::uuid7(),
                    'label' => (string) $level['label'],
                    'points' => (string) $points,
                    'description' => $level['description'] ?? null,
                ];
            }
            if (count($levels) < 2 || count($levels) > self::MAX_LEVELS) {
                throw ValidationException::withMessages(['items' => 'Each rubric criterion needs two to twenty levels.']);
            }
            $total = $total->plus($criterionMaximum);
            $normalized[] = [
                'id' => (string) Str::uuid7(),
                'title' => (string) $criterion['title'],
                'description' => $criterion['description'] ?? null,
                'levels' => $levels,
            ];
        }
        if (count($normalized) > self::MAX_CRITERIA) {
            throw ValidationException::withMessages(['items' => 'Too many rubric criteria.']);
        }
        if (! $total->isEqualTo($maximum)) {
            throw ValidationException::withMessages(['items' => 'Criterion maxima must total the item maximum.']);
        }

        return ['guide' => $guide, 'criteria' => $normalized];
    }

    /** @return list<array{minimum:string,grade:string}> */
    private static function boundaries(array $rows): array
    {
        $boundaries = [];
        $coversZero = false;
        foreach ($rows as $row) {
            $minimum = BigDecimal::of((string) $row['minimum']);
            $coversZero = $coversZero || $minimum->isZero();
            $boundaries[] = ['minimum' => (string) $minimum, 'grade' => (string) $row['grade']];
        }
        if ($boundaries === [] || ! $coversZero) {
            throw ValidationException::withMessages(['boundaries' => 'Grade boundaries must include zero.']);
        }

        return $boundaries;
    }
}
