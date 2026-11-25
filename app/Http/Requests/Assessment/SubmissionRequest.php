<?php

namespace App\Http\Requests\Assessment;

use Illuminate\Foundation\Http\FormRequest;

class SubmissionRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'body' => 'nullable|string|max:100000|required_without:script',
            'script' => 'nullable|file|max:20480',
            'group_id' => 'nullable|uuid',
        ];
    }
}
