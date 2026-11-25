<?php

namespace App\Services\Assessment;

use App\Models\Examination;
use App\Models\ExamSlot;
use App\Models\Question;
use App\Models\QuestionBank;
use App\Models\QuestionVersion;
use Illuminate\Validation\ValidationException;

final class BankDrawSlots
{
    public function append(Examination $exam, string $course, array $draws, int $offset): void
    {
        $fixed = QuestionVersion::whereIn('id', ExamSlot::where('exam_id', $exam->id)
            ->whereNotNull('fixed_version_id')->select('fixed_version_id'))->select('question_id');
        $counts = [];
        foreach ($draws as $i => $row) {
            $bank = QuestionBank::where('course_id', $course)->findOrFail($row['bank_id']);
            $remaining = $counts[$bank->id] ?? Question::where('bank_id', $bank->id)
                ->whereNotIn('id', $fixed)->count();
            if ($remaining < 1) {
                throw ValidationException::withMessages(['draws' => "Not enough unused questions in {$bank->topic}."]);
            }

            $counts[$bank->id] = $remaining - 1;
            ExamSlot::forceCreate([
                'exam_id' => $exam->id, 'position' => $offset + $i + 1,
                'draw_from_bank_id' => $bank->id, 'points' => $row['points'],
            ]);
        }
    }
}
