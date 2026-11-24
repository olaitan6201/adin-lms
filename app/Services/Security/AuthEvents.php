<?php

namespace App\Services\Security;

use App\Models\LoginEvent;
use App\Models\User;

class AuthEvents
{
    public static function record(?User $user, string $outcome): void
    {
        LoginEvent::forceCreate(['user_id' => $user?->id, 'occurred_at' => now(), 'outcome' => $outcome]);
    }
}
