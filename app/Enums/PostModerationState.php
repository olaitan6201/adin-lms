<?php

namespace App\Enums;

enum PostModerationState: string
{
    case Visible = 'visible';
    case Hidden = 'hidden';
}
