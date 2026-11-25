<?php

namespace App\Enums;

enum CommunityAuditAction: string
{
    case PostHidden = 'community.post.hidden';
    case DeliveryRetried = 'community.delivery.retried';
    case LessonPrerequisiteChanged = 'community.lesson.prerequisite_changed';
}
