<?php

namespace App\Enums;

enum TimedNotice: string
{
    case Assignment = 'assignment';
    case Deadline = 'deadline';
    case Material = 'material';
}
