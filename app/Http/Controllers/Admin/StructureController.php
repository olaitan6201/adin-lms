<?php

namespace App\Http\Controllers\Admin;

use App\Http\Requests\AcademicHierarchyRequest;
use App\Http\Resources\Admin\AcademicStructureResource;
use App\Http\Resources\Admin\StructureRegisterResource;
use App\Services\Academics\HierarchyChanges;
use App\Services\Academics\HierarchyVisibility;
use App\Services\Academics\StructureMetrics;
use App\Services\Academics\StructureRegister;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

final class StructureController
{
    public function index(
        Request $request,
        HierarchyVisibility $visibility,
        StructureMetrics $metrics,
        StructureRegister $register,
    ): Response {
        $records = $visibility->records($request->user(), null);
        $structure = new AcademicStructureResource($records + ['metrics' => $metrics->forRecords($records)]);

        return Inertia::render('Admin/LiveStructure', $structure->resolve($request) + [
            'register' => fn (): array => (new StructureRegisterResource($register->records()))->resolve($request),
        ]);
    }

    public function store(AcademicHierarchyRequest $request, HierarchyChanges $changes, string $kind): RedirectResponse
    {
        $changes->create($kind, $request->validated());

        return to_route('admin.structure');
    }

    public function update(
        AcademicHierarchyRequest $request,
        HierarchyChanges $changes,
        string $kind,
        string $record,
    ): RedirectResponse {
        $changes->update($request->user()->id, $kind, $record, $request->validated());

        return to_route('admin.structure');
    }
}
