<?php

namespace App\Enums\Assessment;

enum IntegrityEvent: string
{
    case PageHidden = 'exam.page_hidden';
    case Reviewed = 'exam.signal_reviewed';
    case PolicySet = 'exam.integrity_configured';
}
