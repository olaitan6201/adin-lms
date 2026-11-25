<?php

namespace App\Http\Controllers;

use App\Http\Middleware\EnsureActiveAccount;
use App\Http\Requests\LoginRequest;
use App\Services\Identity\AccountLookup;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class SessionController extends Controller
{
    public function create(Request $request): Response
    {
        return Inertia::render('Login', ['passwordReset' => $request->session()->get('password_reset', false)]);
    }

    public function store(LoginRequest $request, AccountLookup $lookup): RedirectResponse
    {
        $id = $lookup->loginId($request->validated('email'));
        if (! Auth::attempt(['id' => $id, 'status' => 'active', 'password' => $request->validated('password')])) {
            throw ValidationException::withMessages(['email' => __('auth.failed')]);
        }
        $request->session()->regenerate();
        $request->session()->put(EnsureActiveAccount::VERSION, Auth::user()->auth_version);

        return redirect()->intended(route('insights.dashboard'));
    }

    public function destroy(Request $request): RedirectResponse
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return to_route('home');
    }
}
