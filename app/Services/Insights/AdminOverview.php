<?php

namespace App\Services\Insights;

use App\Enums\PermissionCode;
use App\Models\User;
use App\Services\Authority\ScopedAuthority;

final class AdminOverview
{
    public function __construct(
        private InsightScope $scope,
        private ScopedAuthority $authority,
        private AdminOverviewAcademics $academics,
        private AdminOverviewExaminations $examinations,
        private ManagementQueue $management,
        private DashboardActivity $activity,
    ) {}

    /** @param array{session?: string, term?: string} $filters */
    public function build(User $user, array $filters): array
    {
        $offerings = $this->scope->offerings($user, ReportAudience::Institution)
            ->reorder();
        $period = $this->academics->selectPeriod($offerings, $filters);
        $snapshot = $this->academics->snapshot(clone $offerings);
        $canManageExams = $this->authority->institutionAllows($user, PermissionCode::ExaminationsManage);
        $examinations = $canManageExams
            ? $this->examinations->summary(clone $offerings, $filters !== [])
            : ['bank' => [], 'exams' => [], 'subtitle' => 'Examination management access is required.'];

        return [
            'description' => "Current academic records and work queues · {$period}.",
            'tiles' => $snapshot['tiles'],
            'enrolment' => ['session' => $period, 'labels' => [], 'values' => []],
            'service' => ['metrics' => [], 'note' => 'Service performance telemetry is not available on this overview.'],
            'approvals' => $this->management->forUser(
                $user,
                false,
                $canManageExams,
                $filters ? (clone $offerings)->select('o.id') : null,
            ),
            'examinations' => $examinations,
            'canManageExams' => $canManageExams,
            'delivery' => ['labels' => [], 'values' => []],
            'participation' => $snapshot['participation'],
            'activity' => $this->activity->recent($offerings, false)['latest'],
            'links' => [
                'reports' => route('insights.reports', $filters, false),
                'offerings' => $this->link($user, PermissionCode::OfferingsManage, 'academics.delivery'),
                'structure' => $this->link($user, PermissionCode::AcademicsManage, 'academics.index'),
            ],
        ];
    }

    private function link(User $user, PermissionCode $permission, string $route): ?string
    {
        return $this->authority->institutionAllows($user, $permission) ? route($route, [], false) : null;
    }
}
