<?php

namespace App\Services\Lecturer;

use App\Enums\EnrolmentStatus;
use App\Models\Enrolment;
use App\Models\Grade;
use Illuminate\Database\Query\Builder;
use Illuminate\Support\Collection;

final class WorkloadTotalsService
{
    /** @return Collection<string, array{enrolled: int, completed: int, released_results: int, average_percent: ?string}> */
    public function forOfferings(Collection $offeringIds): Collection
    {
        if ($offeringIds->isEmpty()) {
            return collect();
        }
        $enrolments = Enrolment::query()
            ->whereIn('offering_id', $offeringIds)
            ->where('status', EnrolmentStatus::Registered->value)
            ->selectRaw('offering_id, COUNT(*) AS enrolled, SUM(CASE WHEN completed_at IS NOT NULL THEN 1 ELSE 0 END) AS completed')
            ->groupBy('offering_id')
            ->get()
            ->keyBy('offering_id');
        $performance = Grade::query()
            ->join('enrolments', 'enrolments.id', '=', 'grades.enrolment_id')
            ->whereIn('enrolments.offering_id', $offeringIds)
            ->where('enrolments.status', EnrolmentStatus::Registered->value)
            ->whereNotNull('grades.approved_at')
            ->where('grades.published_at', '<=', now())
            ->whereNotExists(function (Builder $latest): void {
                $latest->selectRaw('1')
                    ->from('grades as later_grades')
                    ->whereColumn('later_grades.enrolment_id', 'grades.enrolment_id')
                    ->whereColumn('later_grades.revision', '>', 'grades.revision')
                    ->whereNotNull('later_grades.approved_at')
                    ->where('later_grades.published_at', '<=', now());
            })
            ->selectRaw('enrolments.offering_id, COUNT(*) AS released_results, AVG(grades.total_percent) AS average_percent')
            ->groupBy('enrolments.offering_id')
            ->get()
            ->keyBy('offering_id');

        return $offeringIds->mapWithKeys(function (string $offeringId) use ($enrolments, $performance): array {
            return [$offeringId => $this->totals($enrolments->get($offeringId), $performance->get($offeringId))];
        });
    }

    private function totals(?Enrolment $enrolment, ?Grade $performance): array
    {
        return [
            'enrolled' => (int) ($enrolment?->enrolled ?? 0),
            'completed' => (int) ($enrolment?->completed ?? 0),
            'released_results' => (int) ($performance?->released_results ?? 0),
            'average_percent' => $performance?->average_percent === null
                ? null
                : number_format((float) $performance->average_percent, 2, '.', ''),
        ];
    }
}
