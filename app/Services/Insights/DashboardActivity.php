<?php

namespace App\Services\Insights;

use App\Enums\AuthenticationOutcome;
use Illuminate\Database\Query\Builder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

final class DashboardActivity
{
    public function recent(Builder $scope, bool $institution): array
    {
        $end = now('UTC')->startOfSecond();
        $start = $end->copy()->subDays(7);
        $items = $scope->reorder()->join('gradebooks as b', 'b.offering_id', '=', 'o.id')->join('assessment_items as i', 'i.gradebook_id', '=', 'b.id');
        $revisions = (clone $items)->join('assignments as a', 'a.item_id', '=', 'i.id')->join('submissions as sub', 'sub.assignment_id', '=', 'a.id')
            ->join('submission_versions as v', 'v.submission_id', '=', 'sub.id')->where('v.submitted_at', '>', $start)->where('v.submitted_at', '<=', $end);
        $attempts = $items->join('examinations as ex', 'ex.item_id', '=', 'i.id')->join('examination_attempts as a', 'a.exam_id', '=', 'ex.id')
            ->where('a.started_at', '>', $start)->where('a.started_at', '<=', $end);
        $latest = collect([
            $this->lastEvent(clone $revisions, 'v.submitted_at', 'Assignment revision received'),
            $this->lastEvent(clone $attempts, 'a.started_at', 'Exam attempt started'),
        ])->filter()->sortByDesc('at')->values();
        $academic = ['Assignment revisions received' => $revisions->count(), 'Exam attempts started' => $attempts->count()];
        $usage = null;
        if ($institution) {
            $auth = DB::table('login_events')->whereNotNull('user_id')->whereIn('outcome', [AuthenticationOutcome::PasswordAccepted, AuthenticationOutcome::InstitutionAccepted])
                ->where('occurred_at', '>', $start)->where('occurred_at', '<=', $end)->selectRaw('count(*) as events, count(distinct user_id) as accounts')->first();
            $usage = ['Credential acceptances' => (int) $auth->events, 'Accounts with accepted credentials' => (int) $auth->accounts];
        }

        return ['from' => $start->toIso8601String(), 'until' => $end->toIso8601String(), 'academic' => $academic, 'latest' => $latest, 'usage' => $usage];
    }

    private function lastEvent(Builder $query, string $time, string $kind): ?array
    {
        $row = $query->select('i.title', 'o.external_offering_id', "$time as at")->orderByDesc($time)->orderBy('i.id')->first();

        return $row ? ['title' => $row->title, 'course' => $row->external_offering_id, 'kind' => $kind, 'at' => Carbon::parse($row->at)->toIso8601String()] : null;
    }
}
