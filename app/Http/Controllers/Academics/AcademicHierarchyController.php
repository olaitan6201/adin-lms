<?php

namespace App\Http\Controllers\Academics;

use App\Http\Requests\AcademicHierarchyRequest;
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

    public function destroy(
        Request $request,
        ScopedAuthority $authority,
        Department $department,
    ): RedirectResponse {
        abort_unless($authority->institutionAllows($request->user(), 'academics.manage'), 403);
        try {
            $department->delete();
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
