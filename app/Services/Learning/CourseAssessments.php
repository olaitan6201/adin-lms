<?php

namespace App\Services\Learning;

use App\Models\Accommodation;
use App\Models\AssessmentItem;
use App\Models\Assignment;
use App\Models\Enrolment;
use App\Models\Examination;
use App\Models\ExaminationAttempt;
use App\Models\Gradebook;
use App\Models\Offering;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

final class CourseAssessments
{
    public function rows(Offering $offering, bool $staff, ?Enrolment $learner): Collection
    {
        $items = AssessmentItem::whereIn('gradebook_id', Gradebook::where('offering_id', $offering->id)->select('id'))
            ->orderBy('id')->get(['id', 'title', 'kind', 'weight_percent']);
        $assignments = Assignment::whereIn('item_id', $items->modelKeys())->get()->keyBy('item_id');
        $exams = Examination::whereIn('item_id', $items->modelKeys())->get()->keyBy('item_id');
        $overrides = $learner ? Accommodation::where('enrolment_id', $learner->id)
            ->whereIn('exam_id', $exams->pluck('id'))->get()->keyBy('exam_id') : collect();
        $submitted = $learner ? DB::table('submission_recipients')
            ->join('submission_versions', 'submission_versions.id', '=', 'submission_recipients.version_id')
            ->join('submissions', 'submissions.id', '=', 'submission_versions.submission_id')
            ->where('submission_recipients.enrolment_id', $learner->id)
            ->whereIn('submissions.assignment_id', $assignments->pluck('id'))
            ->pluck('submissions.assignment_id')->flip() : collect();
        $attempts = $learner ? ExaminationAttempt::where('enrolment_id', $learner->id)
            ->whereIn('exam_id', $exams->pluck('id'))->orderBy('ordinal')
            ->get(['id', 'exam_id', 'submitted_at'])->keyBy('exam_id') : collect();

        return $items->map(function ($item) use ($assignments, $exams, $overrides, $staff, $offering, $submitted, $attempts) {
            $assignment = $assignments->get($item->id);
            $exam = $exams->get($item->id);
            $activity = $assignment ?? $exam;
            $rules = $overrides->get($exam?->id)?->overrides ?? [];
            $opens = $activity ? Carbon::parse($rules['opens_at'] ?? $activity->opens_at) : null;
            $closes = $activity ? Carbon::parse($rules['closes_at'] ?? $activity->closes_at) : null;
            $scheduled = $opens?->isFuture();
            $state = ! $activity ? 'Assessment component' : ($scheduled ? 'Upcoming' : ($closes->isPast() ? 'Closed' : 'Open'));
            $attempt = $attempts->get($exam?->id);
            $finished = $submitted->has($assignment?->id) || $attempt?->submitted_at !== null;
            $resume = $attempt && ! $attempt->submitted_at;
            $href = $assignment && ($staff || ! $scheduled) ? route('assignments.show', $assignment)
                : route('assessment.desk', $offering).'#item-'.$item->id;

            return [
                'id' => $item->id,
                'type' => $exam ? 'Quiz' : ucfirst($item->kind->value),
                'title' => $item->title,
                'detail' => ($finished ? 'Submitted' : ($resume ? 'Attempt in progress' : $state)).' · '.(float) $item->weight_percent.'% of result',
                'actionable' => ! $finished && ($resume || ($activity && ! $scheduled && ! $closes->isPast())),
                'at' => $scheduled ? $opens : $assignment?->due_at,
                'dateLabel' => $scheduled ? 'Opens' : 'Due',
                'href' => $resume ? route('assessment.paper', $attempt) : $href,
            ];
        });
    }
}
