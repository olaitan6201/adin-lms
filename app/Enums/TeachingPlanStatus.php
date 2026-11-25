<?php

namespace App\Enums;

enum TeachingPlanStatus: string
{
    case Submitted = 'submitted';
    case Approved = 'approved';
    case Rejected = 'rejected';
}
