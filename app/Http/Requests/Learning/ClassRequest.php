<?php

namespace App\Http\Requests\Learning;

use App\Enums\Learning\ClassStatus;
use App\Policies\LearningPolicy;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ClassRequest extends FormRequest
{
    public function authorize(LearningPolicy $policy): bool
    {
        return $policy->allocated($this->user()->id, $this->route('offering'));
    }

    public function rules(): array
    {
        return [
            'title' => 'required|string|max:191',
            'starts_at' => 'required|date',
            'ends_at' => 'required|date|after:starts_at',
            'meeting_url' => 'nullable|url:https|max:2048',
            'recording_material_id' => 'nullable|uuid',
            'status' => ['required', Rule::enum(ClassStatus::class)],
        ];
    }
}
