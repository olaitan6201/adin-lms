<?php

namespace App\Http\Controllers\Academics;

use App\Http\Requests\AcademicHierarchyRequest;
use App\Models\AuditLog;
use App\Models\Department;
use App\Services\Academics\HierarchyVisibility;
use App\Services\Authority\ScopedAuthority;
use Illuminate\Database\QueryException;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class AcademicHierarchyController
{
    public function index(
        Request $request,
        HierarchyVisibility $visibility,
        ?string $department = null,
    ): Response {
        return Inertia::render('Academics/Hierarchy', $visibility->records($request->user(), $department));
    }

    public function store(AcademicHierarchyRequest $request, string $kind): RedirectResponse
    {
        $table = match ($kind) {
            'sessions', 'levels' => 'academic_'.$kind,
            default => $kind,
        };
        DB::table($table)->insert(['id' => (string) Str::uuid7()] + $request->validated());

        return to_route('academics.index');
    }

    public function update(AcademicHierarchyRequest $request, string $kind, string $record): RedirectResponse
    {
        $table = in_array($kind, ['levels', 'sessions'], true) ? 'academic_'.$kind : $kind;
        DB::transaction(function () use ($request, $table, $record): void {
            $query = DB::table($table)->where('id', $record);
            $before = (array) (clone $query)->lockForUpdate()->firstOrFail();
            $data = $request->validated();
            if ($table === 'programmes' && $before['department_id'] !== $data['department_id']
                && (DB::table('student_sessions')->where('programme_id', $record)->exists()
                    || DB::table('curricula')->where('programme_id', $record)->where('status', 'approved')->exists())) {
                throw ValidationException::withMessages(['department_id' => 'This programme has recorded history. Create a successor programme for the new department.']);
            }
            if ($table === 'departments' && $before['faculty_id'] !== $data['faculty_id']
                && DB::table('programmes')->where('department_id', $record)->exists()) {
                throw ValidationException::withMessages(['faculty_id' => 'This department has linked programmes. Preserve their faculty and create a successor department.']);
            }
            if ($table === 'semesters' && $before['session_id'] !== $data['session_id']
                && DB::table('offerings')->where('semester_id', $record)->exists()) {
                throw ValidationException::withMessages(['session_id' => 'This semester already has offerings. Keep their original academic session.']);
            }
            $query->update($data);
            AuditLog::forceCreate(['actor_id' => $request->user()->id, 'subject_key' => "$table:$record",
                'action' => 'organisation.corrected', 'occurred_at' => now(),
                'details' => ['before' => array_intersect_key($before, $data), 'after' => $data]]);
        });

        return to_route('academics.index');
    }

    public function destroy(
        Request $request,
        ScopedAuthority $authority,
        Department $department,
    ): RedirectResponse {
        abort_unless($authority->institutionAllows($request->user(), 'academics.manage'), 403);
        try {
            DB::transaction(fn () => $department->delete());
        } catch (QueryException $error) {
            if (! str_starts_with((string) $error->getCode(), '23')) {
                throw $error;
            }

            throw ValidationException::withMessages([
                'department' => 'This department is referenced by other records.',
            ]);
        }

        return to_route('academics.index');
    }
}
