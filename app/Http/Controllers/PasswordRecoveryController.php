<?php

namespace App\Http\Controllers;

use App\Http\Requests\ResetLinkRequest;
use App\Http\Requests\ResetPasswordRequest;
use App\Jobs\SendAccountResetLink;
use App\Models\User;
use App\Services\Identity\PasswordRecovery;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class PasswordRecoveryController extends Controller
{
    public function send(ResetLinkRequest $request): RedirectResponse
    {
        SendAccountResetLink::dispatch(User::canonicalEmail($request->validated('email')));

        return to_route('password.request')->with('link_requested', true);
    }

    public function requestLink(Request $request): Response
    {
        return Inertia::render('Auth/ForgotPassword', ['requested' => $request->session()->get('link_requested', false)]);
    }

    public function edit(Request $request, string $token): Response
    {
        return Inertia::render('Auth/ResetPassword', ['email' => $request->string('email', '', true)->toString(), 'token' => $token]);
    }

    public function update(ResetPasswordRequest $request, PasswordRecovery $recovery): RedirectResponse
    {
        if (! $recovery->reset($request->validated('email'), $request->validated('token'), $request->validated('password'))) {
            throw ValidationException::withMessages(['token' => 'This reset link is invalid or has expired. Request a new link.']);
        }

        return to_route('login')->with('password_reset', true);
    }
}
