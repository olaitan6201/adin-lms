<?php

namespace Tests\Feature;

use App\Models\AuthSession;
use App\Models\Credential;
use App\Models\LoginEvent;
use App\Models\User;
use App\Services\Authority\ChangeRoleGrant;
use App\Services\Security\TotpEnrollment;
use Database\Seeders\AuthoritySeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia;
use PragmaRX\Google2FA\Google2FA;
use Tests\TestCase;

class PrivilegedSessionTest extends TestCase
{
    use RefreshDatabase;

    public function test_only_a_verified_out_of_band_factor_unlocks_privileged_access_and_codes_cannot_be_replayed(): void
    {
        $this->withoutVite();
        $user = User::factory()->create();
        $this->seed(AuthoritySeeder::class);
        app(ChangeRoleGrant::class)->apply($user->id, 'ict_admin', 'institution', false);
        $this->post('/login', ['email' => $user->email, 'password' => 'not-the-password'])->assertSessionHasErrors('email');
        $this->login($user);
        $this->get('/courses')->assertRedirect(route('security.challenge'));
        $this->get('/security/login-events')->assertRedirect(route('security.challenge'));
        $this->post('/security/challenge', ['code' => '000000', 'secret' => 'client-supplied'])->assertSessionHasErrors('code');
        $this->assertDatabaseMissing('credentials', ['user_id' => $user->id, 'kind' => 'totp']);

        $secret = app(TotpEnrollment::class)->issue($user);
        $factor = Credential::where('user_id', $user->id)->sole();
        $this->assertStringNotContainsString($secret, $factor->protected_value);
        $this->get('/security/challenge')->assertOk()->assertDontSee($secret);
        $this->get('/courses')->assertRedirect(route('security.challenge'));
        $code = $this->code($secret);
        $this->post('/security/challenge', ['code' => $code])->assertSessionHasNoErrors()->assertRedirect(route('courses.index'));
        $this->assertNull($factor->fresh()->expires_at);
        $this->get('/security/login-events')->assertInertia(fn (AssertableInertia $page) => $page
            ->component('Security/LoginHistory')->has('events.0', fn (AssertableInertia $row) => $row
            ->hasAll('id', 'occurred_at', 'user_id', 'outcome')));
        $this->post('/logout');
        $this->login($user);
        $this->post('/security/challenge', ['code' => $code])->assertSessionHasErrors('code');
        $this->get('/courses')->assertRedirect(route('security.challenge'));
        $this->travel(60)->seconds();
        $this->post('/security/challenge', ['code' => $this->code($secret)])->assertSessionHasNoErrors();
        foreach (['password.failed', 'password.accepted', 'mfa.failed', 'mfa.enrolled', 'mfa.accepted'] as $outcome) {
            $this->assertDatabaseHas('login_events', ['user_id' => $user->id, 'outcome' => $outcome]);
        }
    }

    public function test_expired_enrollment_cannot_be_used(): void
    {
        $user = User::factory()->create();
        $enrollment = app(TotpEnrollment::class);
        $secret = $enrollment->issue($user);
        $this->travel(16)->minutes();
        $this->assertFalse($enrollment->verify($user, $this->code($secret)));
        $this->assertNotSame($secret, $enrollment->issue($user));
    }

    public function test_activity_renews_idle_expiry_but_cannot_resurrect_an_expired_session(): void
    {
        $this->withoutVite();
        config(['session.lifetime' => 10]);
        $this->freezeSecond();
        $user = User::factory()->create();
        $this->login($user);
        $this->travel(9)->minutes();
        $this->get('/courses')->assertOk();
        $this->travel(9)->minutes();
        $this->get('/courses')->assertOk();
        $this->travel(10)->minutes();
        $this->get('/courses')->assertRedirect(route('login'));
        $this->assertGuest();
        $this->assertDatabaseHas('login_events', ['user_id' => $user->id, 'outcome' => 'session.expired']);
    }

    public function test_operator_revocation_is_account_scoped_and_requires_new_login(): void
    {
        $this->withoutVite();
        $user = User::factory()->create();
        $this->login($user);
        $sessionId = AuthSession::sole()->id;
        $this->artisan('security:revoke-sessions', ['user' => User::factory()->create()->id, '--session' => $sessionId])->assertSuccessful();
        $this->get('/security/login-events')->assertForbidden();
        $this->get('/courses')->assertOk();
        $this->artisan('security:revoke-sessions', ['user' => $user->id, '--session' => $sessionId])->assertSuccessful();
        $this->get('/courses')->assertRedirect(route('login'));
        $this->assertGuest();
        $this->login($user);
        $this->get('/courses')->assertOk();
        $this->assertTrue(LoginEvent::where('outcome', 'session.revoked')->exists());
    }

    private function code(string $secret): string
    {
        return app(Google2FA::class)->oathTotp($secret, intdiv(now()->timestamp, 30));
    }

    private function login(User $user): void
    {
        $this->post('/login', ['email' => $user->email, 'password' => 'password'])->assertSessionHasNoErrors()->assertRedirect();
    }
}
