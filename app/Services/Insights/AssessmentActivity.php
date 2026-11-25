<?php

namespace App\Services\Insights;

use Brick\Math\BigDecimal;
use Brick\Math\RoundingMode;
use Carbon\CarbonImmutable;
use Illuminate\Database\Query\Builder;
use Illuminate\Support\Collection;

final class AssessmentActivity
{
    public function append(InsightTable $table, Builder $roster, Collection $courses, ReportAudience $audience): void
    {
        $records = new AssessmentRecords($roster, $courses->keys());
        $receipts = $records->receipts();
        $scores = $records->scores();
        $grades = $records->grades();
        $exams = $records->exams();

        $table->totals += [
            'Submissions' => $receipts->pluck('submission')->unique()->count(),
            'Exam attempts' => $records->attempts(),
            'Published results' => $grades->count(),
            'Exams' => $exams->count(),
        ];
        $this->examPerformance($table, $courses, $exams, $scores);

        if ($audience->isAggregate()) {
            return;
        }

        if ($audience === ReportAudience::Lecturer) {
            $table->totals['Pending marking (recipients)'] = $records->pendingMarks($receipts);
        }

        foreach ($receipts as $receipt) {
            $value = trim($receipt->full_name.' · '.$receipt->receipt);
            $table->add($courses[$receipt->offering_id]->label, 'Submission', $receipt->title, $value);
        }

        foreach ($scores as $score) {
            $value = trim($score->full_name.' · '.$score->points.' / '.$score->maximum_score);
            $table->add($courses[$score->offering_id]->label, 'Score', $score->title, $value);
        }

        foreach ($grades as $grade) {
            $value = $grade->total_percent.'% · '.$grade->grade;
            $table->add($courses[$grade->offering_id]->label, 'Published result', $grade->full_name ?? 'Learner', $value);
        }

        foreach ($exams->filter(fn ($exam) => CarbonImmutable::parse($exam->closes_at)->isFuture()) as $exam) {
            $table->add($courses[$exam->offering_id]->label, 'Exam window', $exam->title, $exam->opens_at.' – '.$exam->closes_at);
        }

        $submitted = $receipts->pluck('assignment')->flip();
        $personal = $audience === ReportAudience::Student;
        foreach ($records->openAssignments() as $assignment) {
            if ($personal && $submitted->has($assignment->id)) {
                continue;
            }

            $category = $personal ? 'Outstanding assignment' : 'Open assignment';
            $table->add($courses[$assignment->offering_id]->label, $category, $assignment->title, $assignment->due_at);
        }
    }

    private function examPerformance(InsightTable $table, Collection $courses, Collection $exams, Collection $scores): void
    {
        $examItems = $exams->pluck('item')->flip();
        $examScores = $scores->filter(fn ($score) => $examItems->has($score->item));

        foreach ($examScores->groupBy('item') as $group) {
            $score = $group->first();
            $sum = $group->reduce(fn (BigDecimal $sum, $row) => $sum->plus((string) $row->points), BigDecimal::zero());
            $mean = $sum->dividedBy($group->count(), 2, RoundingMode::HalfUp);
            $value = $mean.' mean points / '.$score->maximum_score;
            $table->add($courses[$score->offering_id]->label, 'Exam performance', $score->title, $value);
        }
    }
}
