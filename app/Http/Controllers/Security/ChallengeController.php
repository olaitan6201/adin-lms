<?php

namespace App\Http\Controllers\Security;

use App\Http\Controllers\Controller;
use App\Services\Security\TotpEnrollment;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ChallengeController extends Controller
{
    public function show(): Response
    {
        return Inertia::render('Security/Challenge');
    }

    public function verify(Request $request, TotpEnrollment $enrollment): RedirectResponse
    {
        $code = $request->input('code');
        if (! $enrollment->verify($request->user(), is_string($code) ? $code : '')) {
            return to_route('security.challenge')->withErrors(['code' => 'Enter a new six-digit code from your authenticator.']);
        }
        $request->session()->regenerate(true);
        $request->session()->put('security.mfa_user', $request->user()->id);

        return to_route('insights.dashboard');
    }
}
