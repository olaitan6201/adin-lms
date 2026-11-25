<?php

namespace App\Services\Insights;

use App\Enums\PermissionCode;
use App\Models\User;
use App\Services\Authority\ScopedAuthority;
use Illuminate\Support\Collection;

final class DashboardWorkspace
{
    public function __construct(
        private InsightScope $scope,
        private DashboardPeriod $period,
        private DashboardActivity $activity,
        private StudentAgenda $agenda,
        private StudyShelf $shelf,
        private TeachingSnapshot $teaching,
        private InstitutionUsage $usage,
        private StudentReleases $releases,
        private MarkingQueue $marking,
        private ManagementQueue $management,
        private ScopedAuthority $authority,
    ) {}

    public function build(User $user, array $filters = []): array
    {
        $audience = $this->scope->audience($user);
        $operations = $this->authority->institutionAllows($user, PermissionCode::OperationsManage);
        $examOffice = $this->authority->institutionAllows($user, PermissionCode::ExaminationsManage);
        $quality = $this->authority->institutionAllows($user, PermissionCode::ComplianceRead);
        $management = $audience->isAggregate() || $operations || $examOffice || $quality;
        $scope = $this->scope->offerings($user, $audience);
        abort_if($filters !== [] && ! $audience->isAggregate(), 403);
        $period = $audience->isAggregate() ? $this->period->select($scope, $audience, $filters) : null;
        $queue = match (true) {
            $management => $this->management->forUser($user, $operations, $examOffice, $filters ? (clone $scope)->reorder()->select('o.id') : null),
            $audience === ReportAudience::Lecturer => $this->marking->forScope(clone $scope),
            default => $this->agenda->forUser($user, clone $scope),
        };
        $courses = (clone $scope)->limit(6)->get()->map(fn ($c) => [
            'title' => $c->title ?? $c->external_offering_id,
            'code' => $c->external_offering_id,
            'href' => $management ? route('insights.reports', ['offering' => $c->id], false) : route('courses.show', $c->id, false),
        ]);

        return [
            'audience' => match (true) {
                $audience->isAggregate() => $audience->value,
                $examOffice => 'Examinations office',
                $quality => 'Quality assurance',
                $operations => 'Operations',
                default => $audience->value,
            },
            'workspace' => $management ? 'management' : ($audience === ReportAudience::Lecturer ? 'teaching' : 'study'),
            'name' => $user->full_name,
            'queue' => $queue,
            'period' => $period,
            'activity' => $period ? $this->activity->recent(clone $scope, $audience === ReportAudience::Institution && ! $filters) : null,
            'population' => ! $filters && $audience === ReportAudience::Institution ? $this->usage->population(now('UTC')) : null,
            'study' => ! $management && $audience === ReportAudience::Student ? $this->shelf->forUser($user, clone $scope) : null,
            'teaching' => ! $management && $audience === ReportAudience::Lecturer ? $this->teaching->forUser($user, clone $scope) : null,
            'releases' => ! $management && $audience === ReportAudience::Student ? $this->releases->latest($user, $scope) : [],
            'courses' => $courses,
            'tools' => $management ? $this->management->tools($user) : [],
        ];
    }

    public static function chronological(Collection $rows): Collection
    {
        return $rows->sortBy([['at', 'asc'], ['href', 'asc']])->take(12)->values();
    }
}
