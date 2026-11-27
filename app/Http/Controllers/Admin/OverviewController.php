<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\AdminOverviewRequest;
use App\Http\Resources\Admin\AdminOverviewResource;
use App\Services\Insights\AdminOverview;
use Inertia\Inertia;
use Inertia\Response;

final class OverviewController extends Controller
{
    public function __invoke(AdminOverviewRequest $request, AdminOverview $overview): Response
    {
        $data = $overview->build($request->user(), $request->validated());
        $resource = new AdminOverviewResource($data);

        return Inertia::render('Admin/Overview', [
            'overview' => $resource->resolve($request),
        ]);
    }
}
