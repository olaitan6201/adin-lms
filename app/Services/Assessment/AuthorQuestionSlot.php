<?php

namespace App\Services\Assessment;

use App\Enums\Assessment\QuestionKind;
use App\Models\Examination;
use App\Models\ExamSlot;
use App\Models\Question;
use App\Models\QuestionBank;
use App\Models\QuestionVersion;
use Illuminate\Validation\ValidationException;

class AuthorQuestionSlot
{
    public function add(Examination $exam, string $course, int $position, array $row): void
    {
        $bank = QuestionBank::where('course_id', $course)->where('topic', $row['topic'])->first() ?? QuestionBank::forceCreate([
            'course_id' => $course,
            'topic' => $row['topic'],
        ]);
        $question = Question::forceCreate(['bank_id' => $bank->id]);
        $kind = QuestionKind::from($row['kind']);
        $options = $kind->hasChoices() ? $this->choices($row['options'] ?? '') : [];
        $key = $row['key'] ?? null;
        $invalidChoice = $kind->hasChoices() && (count($options) < 2 || ! in_array($key, $options, true));

        if ($invalidChoice || ($kind->isObjective() && $key === null)) {
            throw ValidationException::withMessages([
                "questions.$position.key" => 'Supply a valid objective answer and matching choices.',
            ]);
        }

        $version = QuestionVersion::forceCreate([
            'question_id' => $question->id,
            'revision' => 1,
            'kind' => $row['kind'],
            'prompt' => $row['prompt'],
            'options' => $options,
            'marking_key' => ['accepted' => [$key]],
        ]);
        $random = $row['draw'] ?? false;
        ExamSlot::forceCreate([
            'exam_id' => $exam->id,
            'position' => $position + 1,
            'points' => $row['points'],
            'fixed_version_id' => $random ? null : $version->id,
            'draw_from_bank_id' => $random ? $bank->id : null,
        ]);
    }

    public function selectVersion(Examination $exam, string $course, int $position, array $row): void
    {
        $version = QuestionVersion::whereHas('question.bank', fn ($query) => $query->where('course_id', $course))
            ->findOrFail($row['version_id']);
        ExamSlot::forceCreate([
            'exam_id' => $exam->id,
            'position' => $position + 1,
            'points' => $row['points'],
            'fixed_version_id' => $version->id,
            'draw_from_bank_id' => null,
        ]);
    }

    private function choices(string $lines): array
    {
        return array_values(array_unique(preg_split('/\\R/', trim($lines), -1, PREG_SPLIT_NO_EMPTY)));
    }
}
