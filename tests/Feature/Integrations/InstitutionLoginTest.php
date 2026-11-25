<?php

namespace Tests\Feature\Integrations;

use App\Models\User;
use Database\Seeders\AuthoritySeeder;
use Firebase\JWT\JWT;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Client\Request;
use Illuminate\Support\Facades\Http;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

final class InstitutionLoginTest extends TestCase
{
    use RefreshDatabase;

    private User $account;

    private PartnerKey $partner;

    private string $issuer = 'https://id.example.test';

    protected function setUp(): void
    {
        parent::setUp();
        config(['cache.default' => 'database']);
        Http::preventStrayRequests();
        $this->account = User::factory()->create();
        $this->partner = new PartnerKey;
        config(['integrations.oidc_secret' => 'fixture-only', 'integrations.oidc' => [
            'issuer' => $this->issuer, 'authorization' => $this->issuer.'/auth', 'token' => $this->issuer.'/token',
            'callback' => 'https://campus.example.test/integrations/oidc/callback', 'client' => 'campus',
            'jwks' => $this->partner->jwks(), 'mappings' => [['issuer' => $this->issuer,
                'subject' => 'opaque-123', 'user_id' => $this->account->id]],
        ]]);
    }

    private function simulate(string $fault = ''): string
    {
        $redirect = $this->get(route('integrations.oidc.login'))->assertRedirect()->headers->get('Location');
        $this->assertSame($this->issuer.'/auth', explode('?', $redirect)[0]);
        parse_str(parse_url($redirect, PHP_URL_QUERY), $request);
        $this->assertSame('openid', $request['scope']);
        $this->assertSame('S256', $request['code_challenge_method']);
        Http::fake([$this->issuer.'/token' => function (Request $exchange) use ($request, $fault) {
            $this->assertSame('fixture-code', $exchange['code']);
            $this->assertSame($request['redirect_uri'], $exchange['redirect_uri']);
            $this->assertTrue($exchange->hasHeader('Authorization', 'Basic '.base64_encode('campus:fixture-only')));
            $this->assertSame($request['code_challenge'], JWT::urlsafeB64Encode(hash('sha256', $exchange['code_verifier'], true)));
            $claims = ['iss' => $this->issuer, 'aud' => 'campus', 'sub' => 'opaque-123',
                'iat' => time(), 'exp' => time() + 90, 'nonce' => $request['nonce'], 'email' => $this->account->email];
            if (in_array($fault, ['iss', 'aud', 'sub', 'nonce', 'azp'], true)) {
                $claims[$fault] = 'other';
            }

            if ($fault === 'expired') {
                $claims['exp'] = time() - 1;
            }

            $key = $fault === 'signature' ? new PartnerKey : $this->partner;

            return Http::response(['id_token' => JWT::encode($claims, $key->key, 'RS256', 'fixture')]);
        }]);

        return route('integrations.oidc.callback', ['code' => 'fixture-code', 'state' => $request['state']]);
    }

    public function test_verified_subject_opens_existing_revocable_session(): void
    {
        $url = $this->simulate();
        $this->get($url)->assertRedirect(route('insights.dashboard'))->assertSessionHas('security.token');
        $this->assertAuthenticatedAs($this->account);
        $this->assertDatabaseHas('auth_sessions', ['user_id' => $this->account->id]);
        $this->assertDatabaseHas('login_events', ['user_id' => $this->account->id, 'outcome' => 'oidc.accepted']);
    }

    public static function failures(): array
    {
        return array_map(fn ($value) => [$value], ['iss', 'aud', 'nonce', 'azp', 'sub', 'expired', 'signature', 'inactive']);
    }

    #[DataProvider('failures')]
    public function test_rejects_untrusted_or_unmapped_identity_even_with_matching_email(string $fault): void
    {
        $url = $this->simulate($fault);
        if ($fault === 'inactive') {
            $this->account->forceFill(['status' => 'disabled'])->save();
        }

        $this->get($url)->assertForbidden();
        $this->get($url)->assertForbidden();
        Http::assertSentCount(1);
        $this->assertGuest();
        $this->assertDatabaseCount('auth_sessions', 0);
    }

    public function test_unknown_state_is_denied_before_token_exchange(): void
    {
        $this->simulate();
        $this->get(route('integrations.oidc.callback', ['state' => str_repeat('z', 64), 'code' => 'fixture-code']))
            ->assertForbidden();
        Http::assertNothingSent();
    }

    public function test_state_is_browser_bound_and_expires_even_with_valid_code(): void
    {
        $url = $this->simulate();
        $browser = session('integrations.browser');
        $this->withSession(['integrations.browser' => 'different-browser'])->get($url)->assertForbidden();
        $this->travel(4)->minutes();
        $this->withSession(['integrations.browser' => $browser])->get($url)->assertForbidden();
        Http::assertNothingSent();
    }

    public function test_provider_cannot_satisfy_local_privileged_mfa_challenge(): void
    {
        $this->seed(AuthoritySeeder::class);
        $this->artisan('authority:grant', ['user' => $this->account->id, 'role' => 'institutional_admin',
            'scope' => 'institution'])->assertSuccessful();
        $this->get($this->simulate())->assertRedirect(route('insights.dashboard'))->assertSessionMissing('security.mfa_user');
        $this->get(route('insights.dashboard'))->assertRedirect(route('security.challenge'));
    }
}
