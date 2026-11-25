<?php

namespace App\Enums;

enum StaffAuditEvent: string
{
    case Registered = 'staff.registered';
    case AllocationRemoved = 'allocation.removed';
    case AllocationAssigned = 'allocation.assigned';
}
