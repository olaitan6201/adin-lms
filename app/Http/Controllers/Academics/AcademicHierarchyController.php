<?php

namespace App\Http\Controllers\Academics;

use App\Http\Requests\AcademicHierarchyRequest;
use App\Models\Department;
use App\Services\Academics\HierarchyChanges;
use App\Services\Academics\HierarchyVisibility;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AcademicHierarchyController
{
    public function __construct(private HierarchyChanges $changes) {}

    public function index(
        Request $request,
        HierarchyVisibility $visibility,
        ?string $department = null,
    ): Response {
        return Inertia::render('Academics/Hierarchy', $visibility->records($request->user(), $department));
    }

    public function store(AcademicHierarchyRequest $request, string $kind): RedirectResponse
    {
        $this->changes->create($kind, $request->validated());

        return to_route('academics.index');
    }

    public function update(AcademicHierarchyRequest $request, string $kind, string $record): RedirectResponse
    {
        $this->changes->update($request->user()->id, $kind, $record, $request->validated());

        return to_route('academics.index');
    }

    public function destroy(Department $department): RedirectResponse
    {
        $this->changes->deleteDepartment($department);

        return to_route('academics.index');
    }
}
