<?php

namespace App\Enums\Assessment;

enum ReviewDecision: string
{
    case Correct = 'correct';
    case Approve = 'approve';
    case Publish = 'publish';
}
