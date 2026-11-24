<?php

namespace Tests\Support;

use App\Models\Permission;
use App\Models\Role;
use App\Models\RolePermission;
use App\Models\User;
use App\Services\Authority\ChangeRoleGrant;
use Database\Seeders\AuthoritySeeder;

trait OperationsAccess
{
    private function operator(string ...$permissions): User
    {
        $this->seed(AuthoritySeeder::class);
        $role = Role::where('code', 'ict_admin')->firstOrFail();
        foreach ($permissions as $code) {
            $permission = Permission::unguarded(fn () => Permission::firstOrCreate(['code' => $code]));
            RolePermission::unguarded(fn () => RolePermission::firstOrCreate(['role_id' => $role->id, 'permission_id' => $permission->id]));
        }
        $user = User::factory()->create();
        app(ChangeRoleGrant::class)->apply($user->id, 'ict_admin', 'institution', false);
        $this->actingAs($user)->withSession(['security.mfa_user' => $user->id]);

        return $user;
    }
}
