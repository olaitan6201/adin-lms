<?php

namespace App\Enums\Assessment;

enum ItemKind: string
{
    case Assignment = 'assignment';
    case Exam = 'exam';
    case Manual = 'manual';
    case Attendance = 'attendance';
    case Continuous = 'continuous';

    public function acceptsDirectScores(): bool
    {
        return in_array($this, [self::Manual, self::Attendance, self::Continuous], true);
    }
}
