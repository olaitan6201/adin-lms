<?php

namespace App\Enums;

enum EnrolmentStatus: string
{
    case Registered = 'registered';
    case Withdrawn = 'withdrawn';
}
