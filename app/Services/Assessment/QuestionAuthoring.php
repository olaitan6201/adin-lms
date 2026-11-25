<?php

namespace App\Services\Assessment;

use App\Models\Question;
use App\Models\QuestionBank;
use App\Models\QuestionVersion;
use Illuminate\Support\Facades\DB;

class QuestionAuthoring
{
    public function __construct(private QuestionDefinition $definition) {}

    public function create(string $course, array $data): QuestionVersion
    {
        return DB::transaction(function () use ($course, $data): QuestionVersion {
            $bank = QuestionBank::where('course_id', $course)->where('topic', trim($data['topic']))->first()
                ?? QuestionBank::forceCreate([
                    'course_id' => $course,
                    'topic' => trim($data['topic']),
                ]);
            $question = Question::forceCreate(['bank_id' => $bank->id]);

            return $this->version($question, $data, 1);
        });
    }

    public function update(Question $question, string $course, array $data): QuestionVersion
    {
        return DB::transaction(function () use ($question, $course, $data): QuestionVersion {
            $owned = Question::whereHas('bank', fn ($query) => $query->where('course_id', $course))
                ->lockForUpdate()
                ->findOrFail($question->id);
            $revision = 1 + (int) QuestionVersion::where('question_id', $owned->id)->max('revision');

            return $this->version($owned, $data, $revision);
        });
    }

    private function version(Question $question, array $data, int $revision): QuestionVersion
    {
        return QuestionVersion::forceCreate($this->definition->fromInput($data) + [
            'question_id' => $question->id,
            'revision' => $revision,
        ]);
    }
}
