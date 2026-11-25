<?php

namespace App\Services\Insights;

enum ReportAudience: string
{
    case Institution = 'Institution';
    case AcademicUnit = 'Academic unit';
    case Lecturer = 'Lecturer';
    case Student = 'Student';

    public function isAggregate(): bool
    {
        return $this === self::Institution || $this === self::AcademicUnit;
    }
}
