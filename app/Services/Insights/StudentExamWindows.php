<?php

namespace App\Services\Insights;

use App\Enums\EnrolmentStatus;
use App\Models\User;
use Illuminate\Database\Query\Builder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;

final class StudentExamWindows
{
    public function upcoming(User $user, Builder $scope): Collection
    {
        $now = now();
        $exams = $scope->reorder()
            ->join('enrolments as e', 'e.offering_id', '=', 'o.id')
            ->join('students as st', 'st.id', '=', 'e.student_id')
            ->where('st.user_id', $user->id)->where('e.status', EnrolmentStatus::Registered)
            ->join('gradebooks as b', 'b.offering_id', '=', 'o.id')
            ->join('assessment_items as i', 'i.gradebook_id', '=', 'b.id')
            ->join('examinations as ex', 'ex.item_id', '=', 'i.id')
            ->leftJoin('accommodations as ac', fn ($j) => $j->on('ac.exam_id', '=', 'ex.id')->on('ac.enrolment_id', '=', 'e.id'))
            ->where(fn ($q) => $q->where('ex.closes_at', '>', $now)->orWhereNotNull('ac.id'))
            ->whereNotExists(fn ($q) => $q->from('examination_attempts as p')
                ->whereColumn('p.exam_id', 'ex.id')->whereColumn('p.enrolment_id', 'e.id')->whereNull('p.submitted_at'))
            ->select('o.id', 'o.external_offering_id', 'i.title', 'i.id as item', 'ex.opens_at', 'ex.closes_at', 'ex.max_attempts', 'ac.overrides')
            ->selectSub(fn ($q) => $q->from('examination_attempts as p')->selectRaw('max(p.ordinal)')
                ->whereColumn('p.exam_id', 'ex.id')->whereColumn('p.enrolment_id', 'e.id'), 'last_attempt')
            ->cursor();

        $rows = collect();
        foreach ($exams as $exam) {
            $rules = json_decode($exam->overrides ?? '{}', true, flags: JSON_THROW_ON_ERROR);
            $opens = Carbon::parse($rules['opens_at'] ?? $exam->opens_at);
            $closes = Carbon::parse($rules['closes_at'] ?? $exam->closes_at);
            if ($now->gte($closes) || (int) $exam->last_attempt >= ($rules['max_attempts'] ?? $exam->max_attempts)) {
                continue;
            }

            $scheduled = $now->lt($opens);
            $rows->push([
                'title' => $exam->title, 'context' => $exam->external_offering_id,
                'kind' => $scheduled ? 'Exam opens' : 'Open exam · closes',
                'at' => ($scheduled ? $opens : $closes)->utc()->toIso8601String(),
                'action' => $scheduled ? 'View scheduled exam' : 'Go to exam',
                'href' => route('assessment.desk', $exam->id, false).'#item-'.$exam->item,
            ]);
            if ($rows->count() >= 24) {
                $rows = DashboardWorkspace::chronological($rows);
            }
        }

        return DashboardWorkspace::chronological($rows);
    }
}
