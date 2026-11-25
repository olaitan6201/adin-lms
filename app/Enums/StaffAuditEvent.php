<?php

namespace App\Enums;

enum StaffAuditEvent: string
{
    case Registered = 'staff.registered';
    case Transferred = 'staff.transferred';
    case AllocationRemoved = 'allocation.removed';
    case AllocationAssigned = 'allocation.assigned';
}
