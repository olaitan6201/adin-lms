<?php

namespace App\Services\Assessment;

use App\Enums\Assessment\QuestionKind;
use App\Models\AttemptQuestion;
use Illuminate\Validation\ValidationException;

class AnswerShape
{
    public function validate(AttemptQuestion $question, mixed $answer): string|array|null
    {
        if ($question->version->kind === QuestionKind::Matching) {
            return $this->matching($question, $answer);
        }

        if ($answer !== null && ! is_string($answer)) {
            throw ValidationException::withMessages(['answer' => 'The answer must be text.']);
        }

        if ($question->version->kind->hasChoices() && $answer !== null) {
            $choices = $question->option_order ?: $question->version->options;
            abort_unless(in_array($answer, $choices, true), 422, 'Select a valid choice.');
        }

        return $answer;
    }

    private function matching(AttemptQuestion $question, mixed $answer): ?array
    {
        if ($answer === null || $answer === []) {
            return null;
        }

        $matching = $question->version->marking_key['matching'] ?? null;
        abort_unless($matching !== null, 422, 'Matching key is unavailable.');
        abort_unless(is_array($answer) && count($answer) <= count($matching['left']), 422, 'Invalid matching answer.');
        $left = array_column($matching['left'], 'id');
        $right = array_column($matching['right'], 'id');
        $used = [];
        foreach ($answer as $leftId => $rightId) {
            abort_unless(
                is_string($leftId) && is_string($rightId) && in_array($leftId, $left, true) && in_array($rightId, $right, true),
                422,
                'Matching answer contains an unknown item.',
            );
            abort_unless(! in_array($rightId, $used, true), 422, 'Each matching item can be used only once.');
            $used[] = $rightId;
        }

        return $answer;
    }
}
