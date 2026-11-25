<?php

namespace App\Services\Assessment;

use App\Models\AssessmentItem;
use App\Models\AssessmentScore;
use App\Models\Assignment;
use App\Models\Enrolment;
use App\Models\Examination;
use App\Models\ExaminationAttempt;
use App\Models\Gradebook;
use Illuminate\Support\Collection;

class DeskItems
{
    public function forViewer(?Gradebook $book, bool $teacher, ?Enrolment $learner): Collection
    {
        if (! $book) {
            return collect();
        }

        $items = AssessmentItem::where('gradebook_id', $book->id)->orderBy('id')->get();
        $ids = $items->modelKeys();
        $assignments = Assignment::whereIn('item_id', $ids)
            ->when(! $teacher, fn ($query) => $query->where('opens_at', '<=', now()))
            ->pluck('id', 'item_id');
        $exams = Examination::whereIn('item_id', $ids)->pluck('id', 'item_id');
        $attempts = $teacher ? ExaminationAttempt::whereIn('exam_id', $exams)
            ->whereNotNull('submitted_at')
            ->get(['id', 'exam_id', 'ordinal', 'enrolment_id', 'state'])
            ->groupBy('exam_id') : collect();
        $scores = $learner ? AssessmentScore::whereIn('item_id', $ids)
            ->where('enrolment_id', $learner->id)
            ->where('released_at', '<=', now())
            ->orderBy('revision')
            ->pluck('points', 'item_id') : collect();

        return $items->map(function (AssessmentItem $item) use ($assignments, $exams, $attempts, $scores): array {
            $exam = $exams->get($item->id);

            return $item->only('id', 'title', 'maximum_score', 'weight_percent', 'rubric') + [
                'kind' => $item->kind->value,
                'assignment' => $assignments->get($item->id),
                'exam' => $exam,
                'attempts' => $attempts->get($exam, []),
                'returned' => $scores->get($item->id),
            ];
        });
    }
}
