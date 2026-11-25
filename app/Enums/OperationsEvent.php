<?php

namespace App\Enums;

enum OperationsEvent: string
{
    case FeedbackGranted = 'feedback.granted';
    case FeedbackWithdrawn = 'feedback.withdrawn';
    case RetentionChanged = 'retention.changed';
    case PrivacyApproved = 'privacy.approved';
    case PrivacyExecuted = 'privacy.executed';
    case IncidentReferred = 'privacy.incident_referred';
    case CourseImported = 'course.imported';
    case CourseExported = 'course.exported';
}
