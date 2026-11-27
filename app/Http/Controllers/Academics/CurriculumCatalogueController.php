<?php

namespace App\Http\Controllers\Academics;

use App\Http\Requests\CreateCurriculumRequest;
use App\Http\Requests\CurriculumEntryRequest;
use App\Http\Resources\Academics\CurriculumCataloguePageResource;
use App\Models\Curriculum;
use App\Services\Academics\CurriculumCataloguePage;
use App\Services\Academics\CurriculumVersioning;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CurriculumCatalogueController
{
    public function index(
        Request $request,
        CurriculumCataloguePage $catalogue,
        ?Curriculum $version = null,
    ): Response {
        return Inertia::render(
            'Academics/Catalogue',
            CurriculumCataloguePageResource::make($catalogue->read($request->user(), $version))->resolve($request),
        );
    }

    public function store(CreateCurriculumRequest $request, CurriculumVersioning $versions): RedirectResponse
    {
        $draft = $versions->create(
            $request->validated('programme_id'),
            $request->validated('framework_revision'),
        );

        return to_route('academics.curriculum.show', $draft);
    }

    public function change(
        CurriculumEntryRequest $request,
        CurriculumVersioning $versions,
        string $version,
        string $action,
    ): RedirectResponse {
        return to_route(
            'academics.curriculum.show',
            $versions->change($version, $action, $request->validated(), $request->user()),
        );
    }
}
