<?php

namespace App\Enums;

enum GuardianPermissionEvent: string
{
    case Approved = 'guardian.progress.approved';
    case Revoked = 'guardian.progress.revoked';
}
