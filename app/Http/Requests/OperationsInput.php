<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

final class OperationsInput extends FormRequest
{
    /** @return array<string,string> */
    public function rules(): array
    {
        return match ($this->route()->getName()) {
            'operations.retention' => ['days' => 'required|integer|between:1,3650'],
            'operations.incident' => ['reference' => 'required|string|regex:/^[A-Za-z0-9_-]{1,64}$/D'],
            'operations.approve' => ['operation' => 'required|in:export,purge', 'reference' => 'required|string|regex:/^[A-Za-z0-9_-]{1,64}$/D'],
            'operations.consent' => ['grant' => 'required|boolean', 'notice' => 'required|in:1'],
            'operations.import' => ['package' => 'required|file|max:1024'],
        };
    }
}
