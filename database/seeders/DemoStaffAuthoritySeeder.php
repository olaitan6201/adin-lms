<?php

namespace Database\Seeders;

use App\Enums\RoleCode;
use App\Enums\ScopeType;
use App\Models\Lecturer;
use App\Models\TeachingAllocation;
use App\Models\User;
use App\Services\Authority\ChangeRoleGrant;
use Illuminate\Database\Seeder;
use LogicException;

class DemoStaffAuthoritySeeder extends Seeder
{
    public function run(ChangeRoleGrant $grants): void
    {
        if (! app()->environment('local', 'testing')) {
            throw new LogicException('Staff demo grants require a local or test environment.');
        }

        $officer = User::where('email', 'officer@demo.example.test')->firstOrFail();
        $grants->apply($officer->id, RoleCode::InstitutionalAdmin, ScopeType::Institution->key(), false);
        $lecturer = Lecturer::where('staff_number', 'DEMO-L1')->firstOrFail();
        foreach (TeachingAllocation::where('lecturer_id', $lecturer->id)->pluck('offering_id') as $id) {
            $grants->apply($lecturer->user_id, RoleCode::Lecturer, ScopeType::Offering->key($id), false);
        }
    }
}
