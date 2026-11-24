<?php

namespace App\Http\Controllers;

use App\Http\Requests\InsightFilterRequest;
use App\Services\Insights\AcademicInsights;
use App\Services\Insights\InsightExport;
use App\Services\Insights\InsightTable;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\Response as HttpResponse;

final class InsightController extends Controller
{
    public function page(InsightFilterRequest $request, AcademicInsights $insights): Response
    {
        $data = $insights->build($request->user(), $request->validated());

        return Inertia::render('Insights/Overview', [
            ...$data, 'columns' => InsightTable::COLUMNS, 'dashboard' => $request->routeIs('insights.dashboard'),
            'table' => ['rows' => $data['table']->rows, 'totals' => $data['table']->totals],
        ]);
    }

    public function export(InsightFilterRequest $request, string $format, AcademicInsights $insights, InsightExport $export): HttpResponse
    {
        return $export->download($insights->build($request->user(), $request->validated())['table'], $format);
    }
}
