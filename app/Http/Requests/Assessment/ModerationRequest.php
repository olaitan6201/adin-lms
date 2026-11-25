<?php

namespace App\Http\Requests\Assessment;

use App\Enums\Assessment\ReviewDecision;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ModerationRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'decision' => ['required', Rule::enum(ReviewDecision::class)],
            'reason' => 'required|string|max:2000',
        ];
    }
}
