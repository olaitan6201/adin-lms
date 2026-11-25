<?php

namespace App\Http\Requests\Assessment;

use Illuminate\Foundation\Http\FormRequest;

class AccommodationRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'enrolment' => 'required|uuid',
            'duration_seconds' => 'required|integer|between:1,172800',
            'max_attempts' => 'required|integer|between:1,100',
            'opens_at' => 'required|date',
            'closes_at' => 'required|date|after:opens_at',
        ];
    }
}
