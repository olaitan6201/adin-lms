<?php

namespace App\Http\Requests\Assessment;

use Illuminate\Foundation\Http\FormRequest;

class AssignmentSetupRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'instructions' => 'required|string|max:30000',
            'opens_at' => 'required|date',
            'due_at' => 'required|date|after_or_equal:opens_at',
            'closes_at' => 'required|date|after_or_equal:due_at',
            'formats' => 'required|array|min:1',
            'formats.*' => 'required|in:pdf,txt',
            'max_bytes' => 'required|integer|between:1,20971520',
            'reference' => AssessmentUpload::RULE,
            'editable' => 'nullable|boolean',
            'group_work' => 'nullable|boolean',
            'allow_late' => 'nullable|boolean',
        ];
    }
}
