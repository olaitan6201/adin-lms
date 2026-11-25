<?php

namespace App\Http\Controllers\Integrations;

use App\Models\Offering;
use App\Services\Integrations\BrowserTransactions;
use App\Services\Integrations\LibraryProfiles;
use App\Services\Integrations\PlatformSignature;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Cache;

final class LtiController
{
    private const CLAIM = 'https://purl.imsglobal.org/spec/lti/claim/';

    public function __construct(private BrowserTransactions $transactions, private LibraryProfiles $profiles, private PlatformSignature $signature) {}

    public function keys(): JsonResponse
    {
        return response()->json($this->signature->jwks());
    }

    public function start(Request $request, Offering $offering, string $profile): RedirectResponse
    {
        $tool = $this->profiles->forUser($request->user(), $offering, true)[$profile] ?? null;
        abort_unless($tool, 404);
        $issuer = $this->signature->issuer();
        $hint = $this->transactions->issue($request, 'lti', [
            'user' => $request->user()->id, 'offering' => $offering->id, 'profile' => $profile,
            'registration' => hash('sha256', serialize([$issuer, $tool])),
        ]);
        $query = http_build_query([
            'iss' => $issuer, 'client_id' => $tool['client'], 'login_hint' => $hint,
            'target_link_uri' => $tool['url'], 'lti_deployment_id' => $tool['deployment'],
        ], '', '&', PHP_QUERY_RFC3986);
        abort_if(str_contains($tool['login'], '?') || str_contains($tool['login'], '#'), 503);

        return redirect()->away($tool['login'].'?'.$query, 302, ['Referrer-Policy' => 'no-referrer', 'Cache-Control' => 'no-store']);
    }

    public function authorize(Request $request): Response
    {
        $ticket = $this->transactions->consume($request, 'lti', $request->query('login_hint'));
        abort_unless($request->user()->id === $ticket['user'], 403);
        $offering = Offering::findOrFail($ticket['offering']);
        $tool = $this->profiles->forUser($request->user(), $offering, true)[$ticket['profile']] ?? null;
        $issuer = $this->signature->issuer();
        abort_unless($tool && $ticket['registration'] === hash('sha256', serialize([$issuer, $tool])), 403);
        foreach (['scope' => 'openid', 'response_type' => 'id_token', 'response_mode' => 'form_post',
            'prompt' => 'none', 'client_id' => $tool['client'], 'redirect_uri' => $tool['redirect']] as $key => $value) {
            abort_unless($request->query($key) === $value, 403);
        }
        $state = $request->query('state');
        $nonce = $request->query('nonce');
        foreach ([$state, $nonce] as $opaque) {
            abort_unless(is_string($opaque) && preg_match('/^[\x21-\x7e]{1,512}$/D', $opaque), 403);
        }
        abort_unless(Cache::add('integrations:lti:nonce:'.hash('sha256', serialize([$issuer, $tool['client'], $nonce])), true, 600), 403);
        $pairwise = fn (string $kind, string $id) => hash_hmac('sha256', serialize([$issuer, $tool['client'], $kind, $id]), config('app.key'));
        $claims = [
            'iss' => $issuer, 'aud' => $tool['client'], 'sub' => $pairwise('user', $ticket['user']),
            'iat' => time(), 'exp' => time() + 90, 'nonce' => $nonce,
            self::CLAIM.'message_type' => 'LtiResourceLinkRequest', self::CLAIM.'version' => '1.3.0',
            self::CLAIM.'deployment_id' => $tool['deployment'], self::CLAIM.'target_link_uri' => $tool['url'],
            self::CLAIM.'resource_link' => ['id' => $pairwise('link:'.$ticket['profile'], $offering->id)],
            self::CLAIM.'context' => ['id' => $pairwise('context', $offering->id)],
            self::CLAIM.'roles' => ['http://purl.imsglobal.org/vocab/lis/v2/membership#'.$tool['membership']],
        ];

        return response()->view('integrations.launch', [
            'destination' => $tool['redirect'], 'token' => $this->signature->sign($claims), 'state' => $state,
        ])->withHeaders(['Cache-Control' => 'no-store', 'Referrer-Policy' => 'no-referrer',
            'Content-Security-Policy' => "default-src 'none'; base-uri 'none'; frame-ancestors 'none'; form-action ".$tool['redirect']]);
    }
}
