<?php

namespace App\Enums\Assessment;

enum QuestionKind: string
{
    case MultipleChoice = 'mcq';
    case TrueFalse = 'true_false';
    case GapFill = 'gap_fill';
    case Matching = 'matching';
    case ShortAnswer = 'short_answer';
    case Essay = 'essay';
    case Programming = 'programming';
    case Practical = 'practical';

    public function hasChoices(): bool
    {
        return in_array($this, [self::MultipleChoice, self::TrueFalse], true);
    }

    public function isObjective(): bool
    {
        return $this->hasChoices() || in_array($this, [self::GapFill, self::Matching], true);
    }
}
