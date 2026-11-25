<?php

namespace App\Http\Requests\Assessment;

class SubmissionMarkRequest extends RecordMarkRequest
{
    public function rules(): array
    {
        return parent::rules() + [
            'feedback' => 'nullable|string|max:30000',
            'script' => AssessmentUpload::RULE,
        ];
    }
}
