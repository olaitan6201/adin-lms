<?php

namespace App\Services\Assessment;

use App\Enums\Assessment\QuestionKind;
use App\Models\AttemptQuestion;
use Brick\Math\BigDecimal;
use Brick\Math\RoundingMode;

class MatchingCredit
{
    public function award(AttemptQuestion $question, mixed $answer, RoundingMode $rounding): string
    {
        if ($question->version->kind !== QuestionKind::Matching) {
            $accepted = $question->version->marking_key['accepted'] ?? [];

            return is_string($answer) && in_array($answer, $accepted, true)
                ? (string) $question->possible_points
                : '0';
        }

        $matching = $question->version->marking_key['matching'] ?? null;
        if (! $matching || ! is_array($answer)) {
            return '0';
        }

        $correct = 0;
        $used = [];
        foreach ($answer as $left => $right) {
            if (is_string($left) && is_string($right) && ! in_array($right, $used, true)
                && ($matching['pairs'][$left] ?? null) === $right) {
                $correct++;
            }

            $used[] = $right;
        }

        $pairs = count($matching['pairs']);
        if ($correct === 0 || $pairs === 0) {
            return '0';
        }

        return BigDecimal::of($correct)
            ->multipliedBy((string) $question->possible_points)
            ->dividedBy($pairs, 8, $rounding)
            ->toScale(8, $rounding)
            ->toString();
    }
}
