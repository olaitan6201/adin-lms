<?php

namespace App\Policies;

use App\Models\Offering;
use App\Models\User;
use App\Services\Authority\ScopedAuthority;

class OfferingPolicy
{
    public function __construct(private readonly ScopedAuthority $authority) {}

    public function viewRoster(User $user, Offering $offering): bool
    {
        return $this->authority->rosterAllows($user, $offering);
    }
}
