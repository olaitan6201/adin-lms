<?php

namespace Tests\Feature\Insights;

use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Tests\TestCase;

abstract class InsightCase extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->withoutVite();
        $this->seed(DatabaseSeeder::class);
    }

    protected function loginAs(string $name): User
    {
        $user = User::where('email', "$name@demo.example.test")->firstOrFail();
        $this->actingAs($user)->withSession(['security.mfa_user' => $user->id]);

        return $user;
    }

    protected function data(string $path): array
    {
        return $this->get($path)->assertOk()->viewData('page')['props'];
    }

    protected function record(string $table, array $attributes): string
    {
        $id = (string) Str::uuid7();
        DB::table($table)->insert(['id' => $id] + $attributes);

        return $id;
    }
}
