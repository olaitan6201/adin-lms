<?php

namespace Tests\Support;

use App\Models\User;
use Database\Seeders\AuthoritySeeder;

trait AcademicAccess
{
    private function academicUser(string $role = 'institutional_admin', string $scope = 'institution'): User
    {
        $this->withoutVite();
        $this->seed(AuthoritySeeder::class);
        $user = User::factory()->create();
        $this->artisan('authority:grant', ['user' => $user->id, 'role' => $role, 'scope' => $scope])->assertSuccessful();
        $this->actingAs($user->fresh())->withSession(['security.mfa_user' => $user->id]);

        return $user;
    }
}
