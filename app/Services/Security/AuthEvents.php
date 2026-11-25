<?php

namespace App\Services\Security;

use App\Enums\AuthenticationOutcome;
use App\Models\LoginEvent;
use App\Models\User;

class AuthEvents
{
    public static function record(?User $user, AuthenticationOutcome $outcome): void
    {
        LoginEvent::forceCreate([
            'user_id' => $user?->id,
            'occurred_at' => now(),
            'outcome' => $outcome,
        ]);
    }
}
