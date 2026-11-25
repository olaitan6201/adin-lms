<?php

namespace App\Enums;

enum ReportFamily: string
{
    case Activity = 'activity';
    case Completion = 'completion';
    case Attendance = 'attendance';
    case Examinations = 'examinations';
}
