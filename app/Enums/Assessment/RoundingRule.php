<?php

namespace App\Enums\Assessment;

use Brick\Math\RoundingMode;

enum RoundingRule: string
{
    case HalfUp = 'half_up';
    case HalfEven = 'half_even';
    case Floor = 'floor';
    case None = 'none';

    public function mode(): RoundingMode
    {
        return match ($this) {
            self::HalfUp => RoundingMode::HalfUp,
            self::HalfEven => RoundingMode::HalfEven,
            self::Floor => RoundingMode::Floor,
            self::None => RoundingMode::Unnecessary,
        };
    }
}
