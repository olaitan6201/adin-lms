<?php

namespace App\Http\Controllers\Admin;

use App\Http\Requests\Admin\AcademicCoreRequest;
use App\Http\Resources\Admin\AcademicCoreResource;
use App\Services\Academics\AcademicCorePage;
use Inertia\Inertia;
use Inertia\Response;

final class AcademicCoreController
{
    public function index(AcademicCoreRequest $request, AcademicCorePage $page): Response
    {
        return Inertia::render(
            'Admin/AcademicCore',
            AcademicCoreResource::make($page->read(
                $request->user(),
                $request->validated('course'),
                $request->validated('curriculum'),
            ))->resolve($request),
        );
    }
}
