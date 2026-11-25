<?php

namespace App\Http\Requests\Operations;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

final class BrandingRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'institution' => ['present', 'nullable', 'string', 'max:120', 'not_regex:/[<>\p{Cc}\p{Cf}]/u'],
            'logo' => [
                'bail', 'nullable', Rule::prohibitedIf($this->boolean('restore_logo')), 'file',
                'max:512', 'mimetypes:image/png,image/jpeg', 'dimensions:max_width=512,max_height=512',
            ],
            'restore_logo' => ['sometimes', 'boolean'],
        ];
    }
}
