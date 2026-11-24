<?php

namespace App\Http\Requests\Learning;

use App\Policies\LearningPolicy;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class LessonRequest extends FormRequest
{
    public function authorize(LearningPolicy $policy): bool
    {
        return $policy->allocated($this->user()->id, $this->route('offering'));
    }

    public function rules(): array
    {
        return ['title' => 'required|string|max:191', 'kind' => 'required|in:overview,chapter,topic,weekly',
            'published' => 'required|boolean', 'body' => 'nullable|string|max:250000',
            'position' => ['required', 'integer', 'min:1', 'max:100000', Rule::unique('modules')->where('offering_id', $this->route('offering')->id)->ignore($this->route('lesson')?->id)],
            'opens_at' => 'nullable|date', 'closes_at' => ['nullable', 'date', Rule::when($this->filled('opens_at'), 'after:opens_at')]];
    }
}
