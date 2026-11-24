<?php

namespace App\Http\Requests\Learning;

use App\Policies\LearningPolicy;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class RevisionRequest extends FormRequest
{
    public function authorize(LearningPolicy $policy): bool
    {
        return $policy->allocated($this->user()->id, $this->route('offering'));
    }

    public function rules(): array
    {
        return ['title' => 'required|string|max:191', 'body' => 'nullable|required_without_all:file,external_url|string|max:250000',
            'external_url' => 'nullable|url:https|max:2048', 'file' => 'nullable|file|max:51200', 'download_allowed' => 'required|boolean',
            'opens_at' => 'nullable|date', 'closes_at' => ['nullable', 'date', Rule::when($this->filled('opens_at'), 'after:opens_at')]];
    }
}
