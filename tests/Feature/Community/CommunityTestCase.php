<?php

namespace Tests\Feature\Community;

use App\Models\Offering;
use App\Models\User;
use Database\Seeders\AuthoritySeeder;
use Database\Seeders\DemoCampusSeeder;
use Database\Seeders\DemoStaffAuthoritySeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Route;
use Tests\TestCase;

abstract class CommunityTestCase extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->withoutVite();
        if (! Route::has('community.inbox')) {
            Route::middleware('web')->group(base_path('routes/web/community.php'));
            Route::getRoutes()->refreshNameLookups();
        }
        $this->seed([DemoCampusSeeder::class, AuthoritySeeder::class, DemoStaffAuthoritySeeder::class]);
        $this->withSession(['security.mfa_user' => $this->person('lecturer')->id]);
    }

    protected function course(): Offering
    {
        return Offering::where('external_offering_id', 'DEMO-CSC101-2026-1')->sole();
    }

    protected function person(string $login): User
    {
        return User::where('email', $login.'@demo.example.test')->sole();
    }
}
