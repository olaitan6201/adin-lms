<?php

namespace App\Http\Requests\Assessment;

use App\Enums\Assessment\QuestionKind;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ExamSetupRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'opens_at' => 'required|date',
            'closes_at' => 'required|date|after:opens_at',
            'duration_seconds' => 'required|integer|between:1,86400',
            'max_attempts' => 'required|integer|between:1,100',
            'shuffle' => 'nullable|boolean',
            'questions' => ['required_without:selections', Rule::prohibitedIf(fn (): bool => $this->has('selections')), 'array', 'min:1', 'max:200'],
            'selections' => ['required_without:questions', Rule::prohibitedIf(fn (): bool => $this->has('questions')), 'array', 'min:1', 'max:200'],
            'selections.*.version_id' => ['required', 'uuid'],
            'selections.*.points' => 'required|decimal:0,8|gt:0|max:1000000',
            'questions.*.topic' => 'required|string|max:191',
            'questions.*.kind' => ['required', Rule::enum(QuestionKind::class)],
            'questions.*.prompt' => 'required|string|max:12000',
            'questions.*.options' => 'nullable|string|max:5000',
            'questions.*.key' => 'nullable|string|max:5000',
            'questions.*.points' => 'required|decimal:0,8|gt:0|max:1000000',
            'questions.*.draw' => 'nullable|boolean',
        ];
    }
}
