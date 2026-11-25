<?php

namespace App\Enums;

enum ReportFamily: string
{
    case Activity = 'activity';
    case Completion = 'completion';
    case Engagement = 'engagement';
    case Attendance = 'attendance';
    case Examinations = 'examinations';
    case InstitutionUsage = 'institution-usage';
}
