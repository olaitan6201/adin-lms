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
    case Scheduled = 'schedule_and_inventory_reviewed';
    case Authorised = 'custodian_disposition_authorised';
    case Disposed = 'custodian_execution_recorded';
    case Checked = 'disposition_verified';
}
