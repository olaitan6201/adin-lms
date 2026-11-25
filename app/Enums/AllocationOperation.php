<?php

namespace App\Enums;

enum AllocationOperation: string
{
    case Assign = 'assign';
    case Remove = 'remove';
}
