<?php

namespace App\Services\Integrations;

use App\Models\User;
use Firebase\JWT\JWK;
use Firebase\JWT\JWT;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

final class InstitutionLogin
{
    public function __construct(private BrowserTransactions $transactions) {}

    private function registration(): array
    {
        $registration = config('integrations.oidc');
        abort_unless(is_array($registration) && $registration, 404);
        foreach (['issuer', 'authorization', 'token', 'callback'] as $field) {
            $url = $registration[$field] ?? null;
            abort_unless(LibraryProfiles::publicLink($url) && ! str_contains($url, '?') && ! str_contains($url, '#'), 503);
        }

        abort_unless(is_string($registration['client'] ?? null) && $registration['client'] !== ''
            && is_array($registration['jwks']['keys'] ?? null) && config('integrations.oidc_secret'), 503);

        return $registration;
    }

    public function begin(Request $request): string
    {
        $reg = $this->registration();
        $verifier = Str::random(64);
        $nonce = Str::random(48);
        $state = $this->transactions->issue($request, 'oidc', [
            'registration' => hash('sha256', serialize($reg)), 'verifier' => $verifier, 'nonce' => $nonce,
        ]);

        return $reg['authorization'].'?'.http_build_query([
            'client_id' => $reg['client'], 'redirect_uri' => $reg['callback'], 'response_type' => 'code',
            'scope' => 'openid', 'state' => $state, 'nonce' => $nonce, 'code_challenge_method' => 'S256',
            'code_challenge' => JWT::urlsafeB64Encode(hash('sha256', $verifier, true)),
        ], '', '&', PHP_QUERY_RFC3986);
    }

    public function resolve(Request $request): User
    {
        $reg = $this->registration();
        $ticket = $this->transactions->consume($request, 'oidc', $request->query('state'));
        $code = $request->query('code');
        abort_unless($ticket['registration'] === hash('sha256', serialize($reg)) && ! $request->has('error')
            && $request->query('iss', $reg['issuer']) === $reg['issuer']
            && is_string($code) && strlen($code) > 0 && strlen($code) <= 2048, 403);
        try {
            $response = Http::asForm()->acceptJson()->withoutRedirecting()->timeout(5)
                ->withBasicAuth(urlencode($reg['client']), urlencode(config('integrations.oidc_secret')))
                ->post($reg['token'], ['grant_type' => 'authorization_code', 'code' => $code,
                    'redirect_uri' => $reg['callback'], 'code_verifier' => $ticket['verifier']]);
        } catch (ConnectionException) {
            abort(503);
        }

        $jwt = $response->json('id_token');
        abort_unless($response->ok() && is_string($jwt) && strlen($jwt) <= 16384, 403);
        $keys = array_filter($reg['jwks']['keys'], fn ($key) => ($key['kty'] ?? null) === 'RSA'
            && ($key['alg'] ?? 'RS256') === 'RS256' && ($key['use'] ?? 'sig') === 'sig' && isset($key['kid']));
        try {
            $claims = JWT::decode($jwt, JWK::parseKeySet(['keys' => array_values($keys)], 'RS256'));
        } catch (\Exception) {
            abort(403);
        }

        abort_unless(($claims->iss ?? null) === $reg['issuer'] && ($claims->aud ?? null) === $reg['client']
            && ($claims->azp ?? $reg['client']) === $reg['client'] && ($claims->nonce ?? null) === $ticket['nonce']
            && is_int($claims->iat ?? null) && $claims->iat >= time() - 300 && $claims->iat <= time()
            && is_int($claims->exp ?? null) && $claims->exp > time() && $claims->exp > $claims->iat
            && is_string($claims->sub ?? null) && $claims->sub !== '', 403);
        if (isset($claims->at_hash)) {
            $access = $response->json('access_token');
            abort_unless(is_string($access) && $claims->at_hash === JWT::urlsafeB64Encode(substr(hash('sha256', $access, true), 0, 16)), 403);
        }

        $matches = collect($reg['mappings'] ?? [])->filter(fn ($row) => ($row['issuer'] ?? null) === $claims->iss
            && ($row['subject'] ?? null) === $claims->sub);
        abort_unless($matches->count() === 1 && Str::isUuid($matches->first()['user_id'] ?? ''), 403);
        $user = User::whereKey($matches->first()['user_id'])->where('status', 'active')->first();
        abort_unless($user, 403);

        return $user;
    }
}
