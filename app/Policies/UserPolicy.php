<?php

namespace App\Policies;

use App\Enums\PermissionCode;
use App\Models\User;
use App\Services\Authority\ScopedAuthority;

final class UserPolicy
{
    public function __construct(private readonly ScopedAuthority $authority) {}

    public function viewAny(User $actor): bool
    {
        return $this->authority->institutionAllows($actor, PermissionCode::AccountsManage);
    }

    public function create(User $actor): bool
    {
        return $this->authority->institutionAllows($actor, PermissionCode::AccountsManage);
    }

    public function updateStatus(User $actor): bool
    {
        return $this->authority->institutionAllows($actor, PermissionCode::AccountsManage);
    }

    public function viewAccess(User $actor): bool
    {
        return $this->authority->institutionAllows($actor, PermissionCode::GrantsManage);
    }

    public function manageGrants(User $actor, User $account): bool
    {
        return ! $actor->is($account) && $this->viewAccess($actor);
    }
}
