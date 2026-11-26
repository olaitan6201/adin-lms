<?php

namespace App\Http\Controllers;

use App\Enums\PermissionCode;
use App\Models\Lecturer;
use App\Services\Authority\ScopedAuthority;
use App\Services\Lecturer\TeachingActivity;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class LecturerActivityController extends Controller
{
    public function __invoke(Request $request, Lecturer $lecturer, ScopedAuthority $authority, TeachingActivity $activity): Response
    {
        abort_unless($authority->institutionAllows($request->user(), PermissionCode::StaffManage), 403);
        $dates = $request->validate([
            'from' => 'required_with:until|date_format:Y-m-d',
            'until' => 'required_with:from|date_format:Y-m-d|after_or_equal:from',
        ]);
        $from = $dates['from'] ?? now()->startOfMonth()->toDateString();
        $until = $dates['until'] ?? now()->toDateString();

        return Inertia::render('Staff/Activity', [
            'staff' => $lecturer->only('id', 'staff_number') + ['name' => $lecturer->user->full_name],
            'from' => $from, 'until' => $until,
            'rows' => $activity->byOffering($lecturer->user, $from, $until),
        ]);
    }
}
