<?php

namespace App\Http\Controllers;

use App\Enums\ReportFamily;
use App\Http\Requests\InsightFilterRequest;
use App\Services\Insights\AcademicInsights;
use App\Services\Insights\CohortReports;
use App\Services\Insights\ExportFormat;
use App\Services\Insights\InsightExport;
use App\Services\Insights\InsightScope;
use App\Services\Insights\InsightTable;
use App\Services\Insights\InstitutionUsage;
use App\Services\Insights\ReportLimit;
use App\Services\Insights\ReportSelection;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\Response as HttpResponse;

final class ReportController
{
    public function __construct(
        private AcademicInsights $insights,
        private CohortReports $cohorts,
        private InsightScope $scope,
        private ReportSelection $selection,
        private InstitutionUsage $usage,
    ) {}

    public function page(InsightFilterRequest $request): Response
    {
        $filters = $request->safe()->except('family');
        $audience = $this->scope->audience($request->user());
        $error = null;
        try {
            $table = $this->table($request);
        } catch (ReportLimit $exception) {
            $error = $exception->getMessage();
            $table = new InsightTable;
        }

        return Inertia::render('Insights/Reports', [
            'audience' => $audience->value, 'options' => $request->enum('family', ReportFamily::class) === ReportFamily::InstitutionUsage
                ? null : $this->selection->options($request->user(), $audience, $filters),
            'filters' => $filters, 'family' => $request->input('family', 'activity'),
            'columns' => $table->columns, 'table' => ['rows' => $table->rows, 'totals' => $table->totals],
            'limitMessage' => $error,
        ]);
    }

    public function export(InsightFilterRequest $request, ExportFormat $format, InsightExport $export): HttpResponse
    {
        return $export->download($this->table($request), $format);
    }

    private function table(InsightFilterRequest $request): InsightTable
    {
        $user = $request->user();
        $filters = $request->safe()->except('family');
        $audience = $this->scope->audience($user);

        return match ($request->enum('family', ReportFamily::class) ?? ReportFamily::Activity) {
            ReportFamily::InstitutionUsage => $this->usage->report($audience, $filters),
            ReportFamily::Activity => $this->insights->build($user, $filters)->table,
            ReportFamily::Completion => $this->cohorts->completion($user, $audience, $filters),
            ReportFamily::Engagement => $this->cohorts->engagement($user, $audience, $filters),
            ReportFamily::Attendance => $this->cohorts->attendance($user, $audience, $filters),
            ReportFamily::Examinations => $this->cohorts->examinations($user, $audience, $filters),
        };
    }
}
