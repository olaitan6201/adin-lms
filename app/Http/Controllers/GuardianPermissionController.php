<?php

namespace App\Http\Controllers;

use App\Enums\PermissionCode;
use App\Http\Requests\ApproveGuardianRequest;
use App\Models\GuardianAccess;
use App\Services\Authority\GuardianPermissions;
use App\Services\Authority\ScopedAuthority;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class GuardianPermissionController extends Controller
{
    public function index(Request $request, ScopedAuthority $authority): Response
    {
        abort_unless($authority->institutionAllows($request->user(), PermissionCode::GrantsManage), 403);
        $page = GuardianAccess::with(['guardian:id,email', 'student:id,external_student_id'])->orderByDesc('id')->simplePaginate(25);

        return Inertia::render('Guardian/Permissions', [
            'entries' => $page->getCollection()->map(fn (GuardianAccess $access) => [
                'id' => $access->id, 'guardian' => $access->guardian->email,
                'student' => $access->student->external_student_id, 'revoked' => $access->revoked_at !== null,
                'fields' => $access->allowed_fields,
            ]),
            'previous' => $page->previousPageUrl(), 'next' => $page->nextPageUrl(),
        ]);
    }

    public function store(ApproveGuardianRequest $request, GuardianPermissions $permissions): RedirectResponse
    {
        $permissions->approve($request->user(), $request->validated('guardian_email'), $request->validated('student_reference'));

        return to_route('guardian.permissions.index');
    }

    public function destroy(Request $request, GuardianAccess $access, ScopedAuthority $authority, GuardianPermissions $permissions): RedirectResponse
    {
        abort_unless($authority->institutionAllows($request->user(), PermissionCode::GrantsManage), 403);
        $permissions->revoke($request->user(), $access);

        return to_route('guardian.permissions.index');
    }
}
