<?php

namespace Database\Seeders;

use App\Models\Permission;
use App\Models\Role;
use App\Models\RolePermission;
use App\Services\Authority\RoleCatalogue;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class AuthoritySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::transaction(function (): void {
            foreach (RoleCatalogue::MATRIX as $code => $permissions) {
                $role = Role::firstOrCreate(['code' => $code]);
                foreach ($permissions as $permissionCode) {
                    $permission = Permission::firstOrCreate(['code' => $permissionCode]);
                    RolePermission::firstOrCreate(['role_id' => $role->id, 'permission_id' => $permission->id]);
                }
            }
        });
    }
}
