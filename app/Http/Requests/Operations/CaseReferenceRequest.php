<?php

namespace App\Http\Requests\Operations;

use Illuminate\Foundation\Http\FormRequest;

class CaseReferenceRequest extends FormRequest
{
    public function rules(): array
    {
        return ['reference' => ['required', 'string', 'regex:/^[A-Za-z0-9_-]{1,64}$/D']];
    }
}
