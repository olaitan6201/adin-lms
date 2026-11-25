<?php

namespace App\Http\Requests\Assessment;

use App\Enums\Assessment\QuestionKind;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SaveQuestionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'topic' => 'required|string|max:191',
            'kind' => ['required', Rule::enum(QuestionKind::class)],
            'prompt' => 'required|string|max:12000',
            'options' => 'nullable|string|max:5000',
            'accepted' => 'nullable|string|max:5000',
            'key' => 'nullable|string|max:5000',
            'pairs' => 'nullable|string|max:10000',
            'guide' => 'nullable|string|max:5000',
        ];
    }
}
