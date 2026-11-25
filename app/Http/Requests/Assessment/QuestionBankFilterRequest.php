<?php

namespace App\Http\Requests\Assessment;

use App\Enums\Assessment\QuestionKind;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class QuestionBankFilterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'q' => 'nullable|string|max:191',
            'kind' => ['nullable', Rule::enum(QuestionKind::class)],
            'topic' => 'nullable|string|max:191',
        ];
    }
}
