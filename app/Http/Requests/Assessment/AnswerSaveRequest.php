<?php

namespace App\Http\Requests\Assessment;

use Illuminate\Foundation\Http\FormRequest;

class AnswerSaveRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'revision' => 'required|integer|min:0',
            'answer' => 'present|nullable|string|max:100000',
        ];
    }
}
