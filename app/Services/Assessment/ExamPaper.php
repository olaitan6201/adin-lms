<?php

namespace App\Services\Assessment;

use App\Enums\Assessment\QuestionKind;
use App\Models\AttemptQuestion;
use App\Models\ExaminationAttempt;
use App\Models\ExaminationResponse;
use App\Models\ExamSlot;
use App\Models\QuestionVersion;
use Brick\Math\BigDecimal;

class ExamPaper
{
    public function __construct(private MatchingCredit $matching) {}

    public function generate(ExaminationAttempt $attempt): void
    {
        $exam = $attempt->exam;
        $course = $exam->item->courseId();
        $slots = ExamSlot::where('exam_id', $exam->id)->orderBy('position')->get();
        abort_if($slots->isEmpty(), 422, 'No paper available.');
        $used = QuestionVersion::whereIn('id', $slots
            ->pluck('fixed_version_id')->filter())
            ->pluck('question_id')->all();
        foreach ($slots as $slot) {
            $pool = QuestionVersion::whereHas('question.bank', fn ($q) => $q->where('course_id', $course));
            $version = $slot->fixed_version_id ? $pool->findOrFail($slot->fixed_version_id) : $pool->whereHas(
                'question',
                fn ($q) => $q->where('bank_id', $slot->draw_from_bank_id),
            )
                ->whereNotIn('question_id', $used)
                ->where('revision', fn ($query) => $query->from('question_versions as v')
                    ->selectRaw('max(v.revision)')
                    ->whereColumn('v.question_id', 'question_versions.question_id'))
                ->inRandomOrder()
                ->first();
            abort_unless($version, 422, 'Question pool exhausted.');
            $used[] = $version->question_id;
            $options = $this->optionOrder($version, $exam->shuffle_options);

            AttemptQuestion::forceCreate([
                'attempt_id' => $attempt->id,
                'position' => $slot->position,
                'version_id' => $version->id,
                'possible_points' => $slot->points,
                'option_order' => $options,
            ]);
        }
    }

    public function mark(ExaminationAttempt $attempt): ?string
    {
        $total = BigDecimal::zero();
        $manual = false;
        foreach (AttemptQuestion::with('version')->where('attempt_id', $attempt->id)->get() as $q) {
            if (! $q->version->kind->isObjective()) {
                $manual = true;

                continue;
            }

            $answer = ExaminationResponse::where('attempt_question_id', $q->id)
                ->latest('revision')
                ->first()?->answer['value'] ?? null;
            $points = $this->matching->award($q, $answer);
            $q->forceFill(['awarded_points' => $points])->save();
            $total = $total->plus($points);
        }

        return $manual ? null : (string) $total;
    }

    private function optionOrder(QuestionVersion $version, bool $shuffle): array
    {
        if ($version->kind !== QuestionKind::Matching) {
            $options = $version->options ?? [];
            if ($shuffle) {
                shuffle($options);
            }

            return $options;
        }
        $matching = $version->marking_key['matching'];
        $left = array_column($matching['left'], 'id');
        $right = array_column($matching['right'], 'id');
        if ($shuffle) {
            shuffle($right);
        }

        return compact('left', 'right');
    }
}
