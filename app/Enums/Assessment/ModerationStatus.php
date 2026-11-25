<?php

namespace App\Enums\Assessment;

enum ModerationStatus: string
{
    case Pending = 'pending';
    case Approved = 'approved';
    case CorrectionRequested = 'correction_requested';
}
