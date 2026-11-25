<?php

namespace App\Http\Requests\Operations;

use Illuminate\Foundation\Http\FormRequest;

final class ChangeRetentionRequest extends FormRequest
{
    public function rules(): array
    {
        return ['days' => 'required|integer|between:1,3650'];
    }
}
