<?php

namespace App\Http\Requests\Assessment;

class DirectScoreRequest extends RecordMarkRequest
{
    public function rules(): array
    {
        return parent::rules() + [
            'enrolment' => 'required|uuid',
        ];
    }
}
