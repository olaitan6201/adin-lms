<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class InsightFilterRequest extends FormRequest
{
    public function rules(): array
    {
        return array_fill_keys(['session', 'term', 'offering'], ['sometimes', 'required', 'uuid']);
    }
}
