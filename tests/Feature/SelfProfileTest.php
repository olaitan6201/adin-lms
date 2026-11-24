<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SelfProfileTest extends TestCase
{
    use RefreshDatabase;

    public function test_only_own_profile_name_can_be_changed(): void
    {
        $user = User::factory()->create();
        $other = User::factory()->create();
        $this->post('/login', ['email' => $user->email, 'password' => 'password'])->assertRedirect();

        $this->patch('/profile', [
            'full_name' => 'New Name',
            'email' => 'changed@example.test',
            'status' => 'suspended',
            'role' => 'super_admin',
            'user_id' => $other->id,
        ])->assertRedirect(route('profile.edit'));

        $this->assertDatabaseHas('users', ['id' => $user->id, 'full_name' => 'New Name', 'email' => $user->email, 'status' => 'active']);
        $this->assertDatabaseHas('users', ['id' => $other->id, 'full_name' => $other->full_name]);
        $this->assertDatabaseEmpty('role_grants');
    }
}
