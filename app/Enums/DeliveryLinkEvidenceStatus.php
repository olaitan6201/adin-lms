<?php

namespace App\Enums;

enum DeliveryLinkEvidenceStatus: string
{
    case Unconfirmed = 'unconfirmed';
    case Confirmed = 'confirmed';
    case Blocked = 'blocked';
}
