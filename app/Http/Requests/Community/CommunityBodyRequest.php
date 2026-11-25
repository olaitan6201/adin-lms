<?php

namespace App\Http\Requests\Community;

use Illuminate\Foundation\Http\FormRequest;

class CommunityBodyRequest extends FormRequest
{
    public function body(): string
    {
        return $this->validated('body');
    }

    public function rules(): array
    {
        return ['body' => ['required', 'string', 'max:10000']];
    }
}
