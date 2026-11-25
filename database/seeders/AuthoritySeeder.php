<?php

namespace Database\Seeders;

use App\Enums\RoleCode;
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
            foreach (RoleCode::cases() as $code) {
                $role = Role::firstOrCreate(['code' => $code]);
                foreach (RoleCatalogue::permissions($code) as $permissionCode) {
                    $permission = Permission::firstOrCreate(['code' => $permissionCode]);
                    RolePermission::firstOrCreate(['role_id' => $role->id, 'permission_id' => $permission->id]);
                }
            }
        });
    }
}
