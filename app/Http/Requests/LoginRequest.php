<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class LoginRequest extends FormRequest
{
    public function rules(): array
    {
        return ['email' => ['required', 'string', 'max:191'], 'password' => ['required', 'string', 'max:4096']];
    }
}
