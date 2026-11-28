<?php

namespace App\Enums;

enum PlacementUpdateDisposition: string
{
    case ReadyForReview = 'ready_for_review';
    case HeldForEarlierUpdate = 'held_for_earlier_update';
    case ExactReplay = 'exact_replay';
    case Conflict = 'conflict';
}
