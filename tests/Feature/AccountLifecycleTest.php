<?php

namespace Tests\Feature;

use App\Models\Lecturer;
use App\Models\Student;
use App\Models\User;
use App\Notifications\AccountResetLink;
use App\Services\Authority\ChangeRoleGrant;
use Database\Seeders\AuthoritySeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class AccountLifecycleTest extends TestCase
{
    use RefreshDatabase;

    public function test_login_accepts_all_three_identifiers_and_rejects_cross_account_collisions(): void
    {
        $user = User::factory()->create();
        Student::factory()->create(['user_id' => $user->id, 'matric_number' => 'MAT-01']);
        $staff = Lecturer::factory()->create(['user_id' => $user->id, 'staff_number' => 'STAFF-01']);
        foreach ([strtoupper($user->email), 'MAT-01', 'STAFF-01'] as $identifier) {
            $this->post('/login', ['email' => $identifier, 'password' => 'password'])->assertRedirect(route('insights.dashboard'));
            $this->assertAuthenticatedAs($user);
            $this->post('/logout');
        }
        $staff->forceFill(['staff_number' => 'MAT-01'])->save();
        $this->post('/login', ['email' => 'MAT-01', 'password' => 'password'])->assertRedirect(route('insights.dashboard'));
        $this->post('/logout');
        $staff->forceFill(['user_id' => User::factory()->create(['status' => 'suspended'])->id])->save();
        $this->post('/login', ['email' => 'MAT-01', 'password' => 'password'])->assertSessionHasErrors('email');
        $this->assertGuest();
    }

    public function test_suspension_invalidates_even_an_unvisited_session_after_reactivation(): void
    {
        $admin = $this->administrator();
        $student = Student::factory()->create();
        $user = $student->user;
        $this->post('/login', ['email' => $user->email, 'password' => 'password'])->assertRedirect(route('insights.dashboard'));
        $this->artisan('identity:account', ['action' => 'suspend', 'target' => $user->id, '--actor' => $user->id])->assertFailed();
        $this->artisan('identity:account', ['action' => 'suspend', 'target' => $user->id, '--actor' => $admin->id])->assertSuccessful();
        $this->assertDatabaseHas('users', ['id' => $user->id, 'status' => 'suspended']);
        $this->artisan('identity:account', ['action' => 'reactivate', 'target' => $user->id, '--actor' => $admin->id])->assertSuccessful();
        $this->get('/courses')->assertRedirect(route('login'));
        $this->assertGuest();
        $this->post('/login', ['email' => $user->email, 'password' => 'password'])->assertRedirect(route('insights.dashboard'));
        $this->assertDatabaseHas('students', ['id' => $student->id, 'user_id' => $user->id]);
    }

    public function test_provision_requires_authority_and_sends_a_setup_link_without_a_password(): void
    {
        Notification::fake();
        $admin = $this->administrator();
        $args = ['action' => 'provision', 'target' => 'NEW@Example.test', '--name' => 'New Account'];
        $this->artisan('identity:account', $args + ['--actor' => User::factory()->create()->id])->assertFailed();
        $this->assertDatabaseMissing('users', ['email' => 'new@example.test']);
        $this->artisan('identity:account', $args + ['--actor' => $admin->id])->assertSuccessful();
        $user = User::where('email', 'new@example.test')->sole();
        $this->assertNull($user->password_hash);
        Notification::assertSentTo($user, AccountResetLink::class);
        $this->artisan('identity:account', $args + ['--actor' => $admin->id])->assertFailed();
        $this->assertDatabaseHas('audit_logs', ['actor_id' => $admin->id, 'action' => 'account.provisioned', 'subject_key' => 'user:'.$user->id]);
    }

    public function test_pre_version_browser_session_must_sign_in_again(): void
    {
        $user = User::factory()->create();
        $this->withSession([Auth::guard('web')->getName() => $user->id])
            ->get('/courses')->assertRedirect(route('login'));
        $this->assertGuest();
    }

    private function administrator(): User
    {
        $this->seed(AuthoritySeeder::class);
        $admin = User::factory()->create();
        app(ChangeRoleGrant::class)->apply($admin->id, 'institutional_admin', 'institution', false);

        return $admin;
    }
}
