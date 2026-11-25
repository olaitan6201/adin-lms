<?php

namespace App\Enums;

enum PrivacyCaseStage: string
{
    case Open = 'open';
    case Verified = 'identity_verified';
    case Reviewed = 'extract_reviewed';
    case Delivered = 'response_delivered';
    case Contained = 'containment_recorded';
    case Assessed = 'notification_decision_recorded';
    case FollowedUp = 'notification_followup_recorded';
    case Closed = 'closed';
}
