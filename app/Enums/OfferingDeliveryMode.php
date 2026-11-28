<?php

namespace App\Enums;

enum OfferingDeliveryMode: string
{
    case Online = 'online';
    case Blended = 'blended';
    case FaceToFace = 'face-to-face';
}
