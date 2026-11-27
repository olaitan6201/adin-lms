<?php

namespace App\Http\Controllers\Admin;

use App\Enums\RoleCode;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreAccountGrantRequest;
use App\Http\Resources\Admin\AccountAccessResource;
use App\Models\User;
use App\Services\Identity\AccountAccess;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

final class AccountGrantsController extends Controller
{
    public function show(Request $request, User $account, AccountAccess $access): Response
    {
        $details = $access->details($request->user(), $account);
        $resource = new AccountAccessResource($details);

        return Inertia::render('Admin/Accounts/Access', $resource->resolve($request));
    }

    public function store(StoreAccountGrantRequest $request, User $account, AccountAccess $access): RedirectResponse
    {
        $role = RoleCode::from($request->validated('role'));
        $access->grant($request->user(), $account, $role, $request->validated('reference') ?? '');

        return back();
    }

    public function destroy(Request $request, User $account, string $grant, AccountAccess $access): RedirectResponse
    {
        $access->revoke($request->user(), $account, $grant);

        return back();
    }
}
