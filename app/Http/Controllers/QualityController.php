<?php

namespace App\Http\Controllers;

use App\Enums\PermissionCode;
use App\Services\Academics\QualityEvidence;
use App\Services\Authority\ScopedAuthority;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

final class QualityController
{
    public function __invoke(Request $request, ScopedAuthority $authority, QualityEvidence $evidence): Response
    {
        abort_unless($authority->institutionAllows($request->user(), PermissionCode::ComplianceRead), 403);

        return Inertia::render('Admin/Quality', $evidence->catalogue());
    }
}
