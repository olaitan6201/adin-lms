<?php

namespace App\Http\Requests\Learning;

use App\Enums\Learning\AttendanceStatus;
use App\Policies\LearningPolicy;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class MarkRequest extends FormRequest
{
    public function authorize(LearningPolicy $policy): bool
    {
        return $policy->allocated($this->user()->id, $this->route('offering'));
    }

    public function rules(): array
    {
        return [
            'user_id' => 'required|uuid',
            'status' => ['required', Rule::enum(AttendanceStatus::class)],
            'reason' => 'nullable|string|min:3|max:500',
        ];
    }
}
