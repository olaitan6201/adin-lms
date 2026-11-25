<?php

namespace App\Http\Requests\Assessment;

use Illuminate\Foundation\Http\FormRequest;

class RecordMarkRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'points' => 'required|decimal:0,8|min:0',
            'reason' => 'required|string|max:2000',
            'release' => 'nullable|boolean',
        ];
    }
}
