<?php

namespace App\Http\Controllers\Community;

use App\Enums\PermissionCode;
use App\Services\Authority\ScopedAuthority;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

final class NotificationSettingsController
{
    public function __invoke(Request $request, ScopedAuthority $authority): Response
    {
        $user = $request->user();

        return Inertia::render('Community/NotificationSettings', [
            'email' => $user->email,
            'profileUrl' => route('profile.edit', [], false),
            'sessionsUrl' => $authority->institutionAllows($user, PermissionCode::OperationsManage)
                ? route('security.sessions', [], false) : null,
        ]);
    }
}
