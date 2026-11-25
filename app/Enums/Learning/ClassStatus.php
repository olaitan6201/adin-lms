<?php

namespace App\Enums\Learning;

enum ClassStatus: string
{
    case Scheduled = 'scheduled';
    case Held = 'held';
    case Cancelled = 'cancelled';
}
