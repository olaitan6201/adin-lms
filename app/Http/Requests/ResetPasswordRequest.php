<?php

namespace App\Http\Requests;

use Illuminate\Validation\Rules\Password;

class ResetPasswordRequest extends ResetLinkRequest
{
    public function rules(): array
    {
        return parent::rules() + [
            'token' => ['required', 'string', 'size:64'],
            'password' => ['bail', 'required', 'string', 'confirmed', Password::min(12), function (string $attribute, string $value, \Closure $fail): void {
                if (strlen($value) > 72 || str_contains($value, "\0")) {
                    $fail('Use at most 72 bytes and no null characters.');
                }
            }],
        ];
    }
}
