<?php

namespace App\Services\Insights;

use App\Enums\Assessment\QuestionKind;
use App\Enums\OfferingStatus;
use Illuminate\Database\Query\Builder;
use Illuminate\Support\Facades\DB;

final class AdminOverviewExaminations
{
    public function summary(Builder $offerings, bool $filtered): array
    {
        $now = now('UTC');
        $exams = (clone $offerings)
            ->where('o.status', OfferingStatus::Published)
            ->join('gradebooks as b', 'b.offering_id', '=', 'o.id')
            ->join('assessment_items as i', 'i.gradebook_id', '=', 'b.id')
            ->join('examinations as ex', 'ex.item_id', '=', 'i.id')
            ->where('ex.closes_at', '>', $now)
            ->select('ex.id', 'i.title', 'o.external_offering_id', 'ex.opens_at', 'ex.closes_at')
            ->orderBy('ex.opens_at')
            ->orderBy('ex.id')
            ->limit(6)
            ->get();

        $courses = $filtered
            ? $offerings->select('c.id')
                ->whereNotNull('c.id')
            : null;

        return [
            'bank' => $this->bank($courses),
            'exams' => $exams,
            'subtitle' => 'Examination windows on published offerings and latest question-bank revisions.',
            'asOf' => $now,
        ];
    }

    private function bank(?Builder $courses): array
    {
        $counts = DB::table('question_versions as v')
            ->when($courses, fn (Builder $query) => $query
                ->join('questions as q', 'q.id', '=', 'v.question_id')
                ->join('question_banks as b', 'b.id', '=', 'q.bank_id')
                ->whereIn('b.course_id', $courses))
            ->whereNotExists(fn (Builder $query) => $query->from('question_versions as later')
                ->whereColumn('later.question_id', 'v.question_id')
                ->whereColumn('later.revision', '>', 'v.revision'))
            ->groupBy('v.kind')
            ->select('v.kind')
            ->selectRaw('count(*) as total')
            ->pluck('total', 'kind');

        $categories = [
            'Objective' => ['value' => 0, 'color' => '#10B981'],
            'Short answer' => ['value' => 0, 'color' => '#33475F'],
            'Essay' => ['value' => 0, 'color' => '#F59E0B'],
            'Other' => ['value' => 0, 'color' => '#3B82F6'],
        ];
        
        foreach ($counts as $kind => $count) {
            $questionKind = QuestionKind::tryFrom($kind);
            $label = match (true) {
                $questionKind?->isObjective() => 'Objective',
                $questionKind === QuestionKind::ShortAnswer => 'Short answer',
                $questionKind === QuestionKind::Essay => 'Essay',
                default => 'Other',
            };
            $categories[$label]['value'] += (int) $count;
        }

        return collect($categories)
            ->filter(fn (array $metric): bool => $metric['value'] > 0)
            ->map(fn (array $metric, string $label): array => ['label' => $label] + $metric)
            ->values()
            ->all();
    }
}
