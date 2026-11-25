<?php

namespace App\Http\Requests\Community;

use Illuminate\Foundation\Http\FormRequest;

final class UpdateReadStateRequest extends FormRequest
{
    public function rules(): array
    {
        return ['read' => ['required', 'boolean']];
    }
}
