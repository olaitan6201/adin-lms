<?php

namespace Tests\Feature;

use App\Models\User;
use App\Notifications\AccountResetLink;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class PasswordRecoveryTest extends TestCase
{
    use RefreshDatabase;

    public function test_request_is_indistinguishable_for_missing_inactive_and_eligible_accounts(): void
    {
        Notification::fake();
        $user = User::factory()->create();
        $inactive = User::factory()->create(['status' => 'suspended']);
        foreach (['unknown@example.test', $inactive->email, strtoupper($user->email), $user->email] as $email) {
            $this->post('/forgot-password', compact('email'))->assertRedirect(route('password.request'))->assertSessionHas('link_requested', true);
        }
        Notification::assertSentToTimes($user, AccountResetLink::class, 1);
        Notification::assertNothingSentTo($inactive);
        $this->post('/login', ['email' => $inactive->email, 'password' => 'password'])->assertSessionHasErrors('email');
        $this->assertGuest();
    }

    public function test_reset_uses_original_mixed_case_storage_and_token_is_consumed_once(): void
    {
        Notification::fake();
        $user = User::factory()->create();
        DB::table('users')->where('id', $user->id)->update(['email' => 'Legacy@Example.test']);
        $email = 'legacy@example.test';
        $this->post('/forgot-password', compact('email'));
        $notification = Notification::sent($user, AccountResetLink::class)->sole();
        $this->assertStringStartsWith(config('app.url').'/reset-password/', $notification->toMail($user)->actionUrl);
        $this->assertDatabaseMissing('password_reset_tokens', ['token' => $notification->token]);
        $this->post('/reset-password', $this->payload($email, $notification->token))->assertRedirect(route('login'));
        $this->assertTrue(Hash::check('a new passphrase', $user->fresh()->password_hash));
        $this->post('/reset-password', $this->payload($email, $notification->token))->assertSessionHasErrors('token');
    }

    public function test_expired_token_cannot_change_password(): void
    {
        Notification::fake();
        $user = User::factory()->create();
        $this->post('/forgot-password', ['email' => $user->email]);
        $token = Notification::sent($user, AccountResetLink::class)->sole()->token;
        $this->travel(config('auth.passwords.users.expire') + 1)->minutes();
        $this->post('/reset-password', $this->payload($user->email, $token))->assertSessionHasErrors('token');
        $this->assertSame($user->password_hash, $user->fresh()->password_hash);
    }

    private function payload(string $email, string $token): array
    {
        return ['email' => $email, 'token' => $token, 'password' => 'a new passphrase', 'password_confirmation' => 'a new passphrase'];
    }
}
