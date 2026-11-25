<?php

namespace Tests\Feature;

use App\Enums\RoleCode;
use App\Enums\ScopeType;
use App\Models\User;
use App\Services\Authority\ChangeRoleGrant;
use Database\Seeders\AuthoritySeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

class SeededOperationsAuthorityTest extends TestCase
{
    use RefreshDatabase;

    public static function access(): array
    {
        return [
            [RoleCode::SuperAdmin, 200, 200, 200],
            [RoleCode::InstitutionalAdmin, 403, 403, 200],
            [RoleCode::IctAdmin, 200, 403, 403],
            [RoleCode::Student, 403, 403, 403],
        ];
    }

    #[DataProvider('access')]
    public function test_seeded_role_controls_operations_desks(RoleCode $role, int $operations, int $privacy, int $portability): void
    {
        $this->withoutVite();
        $this->seed(AuthoritySeeder::class);
        $user = User::factory()->create();
        app(ChangeRoleGrant::class)->apply($user->id, $role, ScopeType::Institution->key(), false);
        $this->actingAs($user->fresh())->withSession(['security.mfa_user' => $user->id]);

        $this->get('/operations')->assertStatus($operations);
        $this->get('/operations/privacy')->assertStatus($privacy);
        $this->get('/operations/courses')->assertStatus($portability);
    }
}
