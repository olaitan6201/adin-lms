<?php

namespace App\Services\Assessment;

use App\Models\AttemptQuestion;
use App\Models\ExaminationAttempt;
use App\Models\ExaminationResponse;
use App\Models\ExamSlot;
use App\Models\QuestionVersion;
use Brick\Math\BigDecimal;

class ExamPaper
{
    public function generate(ExaminationAttempt $attempt): void
    {
        $exam = $attempt->exam;
        $course = $exam->item->gradebook->offering->curriculumCourse?->course_id ?? abort(422, 'Offering needs a curriculum course.');
        $slots = ExamSlot::where('exam_id', $exam->id)->orderBy('position')->get();
        abort_if($slots->isEmpty(), 422, 'No paper available.');
        $used = QuestionVersion::whereIn('id', $slots->pluck('fixed_version_id')->filter())->pluck('question_id')->all();
        foreach ($slots as $slot) {
            $pool = QuestionVersion::whereHas('question.bank', fn ($q) => $q->where('course_id', $course));
            $version = $slot->fixed_version_id ? $pool->findOrFail($slot->fixed_version_id) : $pool->whereHas('question', fn ($q) => $q->where('bank_id', $slot->draw_from_bank_id))->whereNotIn('question_id', $used)->whereRaw('revision = (select max(v.revision) from question_versions v where v.question_id = question_versions.question_id)')->inRandomOrder()->first();
            abort_unless($version, 422, 'Question pool exhausted.');
            $used[] = $version->question_id;
            $options = $version->options ?? [];
            if ($exam->shuffle_options) {
                shuffle($options);
            }
            AttemptQuestion::forceCreate(['attempt_id' => $attempt->id, 'position' => $slot->position, 'version_id' => $version->id, 'possible_points' => $slot->points, 'option_order' => $options]);
        }
    }

    public function mark(ExaminationAttempt $attempt): ?string
    {
        $total = BigDecimal::zero();
        $manual = false;
        foreach (AttemptQuestion::with('version')->where('attempt_id', $attempt->id)->get() as $q) {
            if (! in_array($q->version->kind, ['mcq', 'true_false', 'gap_fill', 'matching'], true)) {
                $manual = true;

                continue;
            }
            $answer = ExaminationResponse::where('attempt_question_id', $q->id)->latest('revision')->first()?->answer['value'] ?? null;
            $points = $answer !== null && in_array($answer, $q->version->marking_key['accepted'] ?? [], true) ? (string) $q->possible_points : '0';
            $q->forceFill(['awarded_points' => $points])->save();
            $total = $total->plus($points);
        }

        return $manual ? null : (string) $total;
    }
}
