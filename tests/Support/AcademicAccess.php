<?php

namespace Tests\Support;

use App\Models\Permission;
use App\Models\Role;
use App\Models\RolePermission;
use App\Models\User;
use Database\Seeders\AuthoritySeeder;

trait AcademicAccess
{
    private function academicUser(array $permissions = [], string $role = 'institutional_admin', string $scope = 'institution'): User
    {
        $this->withoutVite();
        $this->seed(AuthoritySeeder::class);
        foreach ($permissions as $code) {
            $permission = Permission::unguarded(fn () => Permission::firstOrCreate(['code' => $code]));
            RolePermission::unguarded(fn () => RolePermission::firstOrCreate(['role_id' => Role::where('code', $role)->value('id'), 'permission_id' => $permission->id]));
        }
        $user = User::factory()->create();
        $this->artisan('authority:grant', ['user' => $user->id, 'role' => $role, 'scope' => $scope])->assertSuccessful();
        $this->actingAs($user->fresh())->withSession(['security.mfa_user' => $user->id]);

        return $user;
    }
}
