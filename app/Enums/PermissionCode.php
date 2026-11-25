<?php

namespace App\Enums;

enum PermissionCode: string
{
    case RosterRead = 'roster.read';
    case AccountsManage = 'accounts.manage';
    case GrantsManage = 'grants.manage';
    case LoginEventsRead = 'login_events.read';
    case StaffManage = 'staff.manage';
    case AcademicsManage = 'academics.manage';
    case CurriculumEdit = 'curriculum.edit';
    case OfferingsManage = 'offerings.manage';
    case CurriculumApprove = 'curriculum.approve';
    case CoursesReadOwn = 'courses.read_own';
    case ExaminationsManage = 'examinations.manage';
    case ComplianceRead = 'compliance.read';
    case ProgressReadApproved = 'progress.read_approved';
    case OperationsManage = 'operations.manage';
    case PrivacyManage = 'privacy.manage';
    case PortabilityManage = 'portability.manage';
}
