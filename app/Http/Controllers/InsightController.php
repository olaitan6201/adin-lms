<?php

namespace App\Http\Controllers;

use App\Http\Requests\InsightFilterRequest;
use App\Services\Insights\AcademicInsights;
use App\Services\Insights\DashboardWorkspace;
use App\Services\Insights\ExportFormat;
use App\Services\Insights\InsightExport;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\Response as HttpResponse;

final class InsightController extends Controller
{
    public function dashboard(InsightFilterRequest $request, DashboardWorkspace $workspace): Response|RedirectResponse
    {
        if ($filters = $request->validated()) {
            return to_route('insights.reports', $filters);
        }

        return Inertia::render('Insights/Dashboard', $workspace->build($request->user()));
    }

    public function page(InsightFilterRequest $request, AcademicInsights $insights): Response
    {
        $report = $insights->build($request->user(), $request->validated());

        return Inertia::render('Insights/Overview', [
            ...$report->pageProps(),
            'dashboard' => false,
        ]);
    }

    public function export(InsightFilterRequest $request, ExportFormat $format, AcademicInsights $insights, InsightExport $export): HttpResponse
    {
        $report = $insights->build($request->user(), $request->validated());

        return $export->download($report->table, $format);
    }
}
