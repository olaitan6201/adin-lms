<?php

namespace App\Enums\Assessment;

enum AttemptState: string
{
    case Active = 'active';
    case AwaitingReview = 'awaiting_review';
    case Submitted = 'submitted';
    case Marked = 'marked';
}
