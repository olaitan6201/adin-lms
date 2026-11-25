<?php

namespace App\Services\Assessment;

use App\Models\Examination;
use App\Models\ExamSlot;
use App\Models\Question;
use App\Models\QuestionBank;
use App\Models\QuestionVersion;

class AuthorQuestionSlot
{
    public function __construct(private QuestionDefinition $definition) {}

    public function add(Examination $exam, string $course, int $position, array $row): void
    {
        $bank = QuestionBank::where('course_id', $course)->where('topic', $row['topic'])->first() ?? QuestionBank::forceCreate([
            'course_id' => $course,
            'topic' => $row['topic'],
        ]);
        $question = Question::forceCreate(['bank_id' => $bank->id]);
        $version = QuestionVersion::forceCreate($this->definition->fromInput($row) + [
            'question_id' => $question->id,
            'revision' => 1,
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
}
