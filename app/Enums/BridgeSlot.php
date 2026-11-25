<?php

namespace App\Enums;

enum BridgeSlot: string
{
    case Primary = 'primary';
    case Standby = 'standby';
    case Disabled = 'disabled';

    public function key(): ?string
    {
        return match ($this) {
            self::Primary => config('learning.attendance_bridge_key'),
            self::Standby => config('learning.attendance_bridge_standby_key'),
            self::Disabled => null,
        };
    }
}
