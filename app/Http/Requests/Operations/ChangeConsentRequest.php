<?php

namespace App\Http\Requests\Operations;

use App\Services\Operations\ConsentRegister;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

final class ChangeConsentRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'grant' => ['required', 'boolean'],
            'notice' => ['required', Rule::in([ConsentRegister::NOTICE])],
        ];
    }
}
