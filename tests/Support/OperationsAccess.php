<?php

namespace Tests\Support;

use App\Enums\RoleCode;
use App\Enums\ScopeType;
use App\Models\User;
use App\Services\Authority\ChangeRoleGrant;
use Database\Seeders\AuthoritySeeder;

trait OperationsAccess
{
    private function operator(RoleCode $role = RoleCode::SuperAdmin): User
    {
        $this->seed(AuthoritySeeder::class);
        $user = User::factory()->create();
        app(ChangeRoleGrant::class)->apply($user->id, $role, ScopeType::Institution->key(), false);
        $this->actingAs($user)->withSession(['security.mfa_user' => $user->id]);

        return $user;
    }
}
