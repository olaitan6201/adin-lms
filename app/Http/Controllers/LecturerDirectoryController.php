<?php

namespace App\Http\Controllers;

use App\Enums\PermissionCode;
use App\Enums\StaffAuditEvent;
use App\Http\Requests\StoreLecturerRequest;
use App\Models\AuditLog;
use App\Models\Department;
use App\Models\Lecturer;
use App\Services\Authority\ScopedAuthority;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class LecturerDirectoryController extends Controller
{
    public function index(Request $request, ScopedAuthority $authority): Response
    {
        abort_unless($authority->institutionAllows($request->user(), PermissionCode::StaffManage), 403);
        $staff = Lecturer::join('departments', 'departments.id', '=', 'lecturers.department_id')
            ->join('users', 'users.id', '=', 'lecturers.user_id')
            ->orderBy('lecturers.staff_number')
            ->with(['allocations:id,lecturer_id,offering_id', 'allocations.offering:id,external_offering_id'])
            ->simplePaginate(50, [
                'lecturers.id',
                'staff_number',
                'users.full_name',
                'departments.name as department',
            ]);

        return Inertia::render('StaffDirectory', [
            'staff' => $staff->getCollection()->map(
                fn (Lecturer $lecturer) => $lecturer->only('staff_number', 'full_name', 'department') + [
                    'offerings' => $lecturer->allocations
                        ->pluck('offering.external_offering_id')
                        ->sort()
                        ->values(),
                ],
            ),
            'previous' => $staff->previousPageUrl(),
            'next' => $staff->nextPageUrl(),
            'departments' => Department::orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function store(StoreLecturerRequest $request): RedirectResponse
    {
        try {
            DB::transaction(function () use ($request): void {
                $staff = Lecturer::forceCreate(
                    $request->safe()->only('user_id', 'department_id', 'staff_number'),
                );
                AuditLog::forceCreate([
                    'subject_key' => 'lecturer:'.$staff->id,
                    'action' => StaffAuditEvent::Registered->value,
                    'actor_id' => $request->user()->id,
                    'occurred_at' => now(),
                    'details' => [
                        'verified_account' => $staff->user_id,
                        'department' => $staff->department_id,
                    ],
                ]);
            });
        } catch (UniqueConstraintViolationException) {
            throw ValidationException::withMessages([
                'staff_number' => 'The account or staff number is already registered.',
            ]);
        }

        return to_route('staff.index');
    }
}
