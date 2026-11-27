<?php

namespace App\Http\Controllers;

use App\Http\Requests\InsightFilterRequest;
use App\Services\Insights\DashboardWorkspace;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

final class InsightController extends Controller
{
    public function dashboard(
        InsightFilterRequest $request,
        DashboardWorkspace $workspace,
    ): Response|RedirectResponse {
        $filters = $request->validated();
        if (isset($filters['offering']) || isset($filters['family'])) {
            return to_route('insights.reports', $filters);
        }

        return Inertia::render('Insights/Dashboard', $workspace->build($request->user(), $filters));
    }
}
