<?php

namespace App\Http\Controllers;

use App\Enums\PermissionCode;
use App\Http\Requests\UpdateProfileRequest;
use App\Http\Resources\ProfileResource;
use App\Services\Authority\ScopedAuthority;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    public function edit(Request $request, ScopedAuthority $authority): Response
    {
        return Inertia::render('Account/Profile', [
            'profile' => ProfileResource::make($request->user())->resolve($request),
            'sharedProgressUrl' => $authority->institutionAllows($request->user(), PermissionCode::ProgressReadApproved)
                ? route('guardian.index', [], false) : null,
            'guardianPermissionsUrl' => $authority->institutionAllows($request->user(), PermissionCode::GrantsManage)
                ? route('guardian.permissions.index', [], false) : null,
        ]);
    }

    public function update(UpdateProfileRequest $request): RedirectResponse
    {
        $request->user()->update($request->safe()->only('full_name'));

        return to_route('profile.edit');
    }
}
