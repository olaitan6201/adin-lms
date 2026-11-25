<?php

namespace App\Http\Controllers\Integrations;

use App\Http\Middleware\EnsureActiveAccount;
use App\Services\Integrations\InstitutionLogin;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

final class InstitutionLoginController
{
    public function start(Request $request, InstitutionLogin $login): RedirectResponse
    {
        return redirect()->away($login->begin($request), 302, ['Referrer-Policy' => 'no-referrer', 'Cache-Control' => 'no-store']);
    }

    public function callback(Request $request, InstitutionLogin $login): RedirectResponse
    {
        $user = $login->resolve($request);
        Auth::login($user);
        $request->session()->regenerate();
        $request->session()->put(EnsureActiveAccount::VERSION, $user->auth_version);

        return to_route('insights.dashboard')->withHeaders(['Referrer-Policy' => 'no-referrer', 'Cache-Control' => 'no-store']);
    }
}
