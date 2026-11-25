<?php

namespace App\Http\Requests\Learning;

use App\Policies\LearningPolicy;
use Illuminate\Foundation\Http\FormRequest;

final class SubmitTeachingPlanRequest extends FormRequest
{
    public function authorize(LearningPolicy $policy): bool
    {
        return $policy->allocated($this->user()->id, $this->route('offering'));
    }

    public function rules(): array
    {
        return [
            'previous_revision' => 'required|integer|min:0',
            'title' => 'required|string|max:191',
            'introduction' => 'required|string|max:20000',
            'weeks' => 'required|array|list|min:1|max:32',
            'weeks.*' => 'required|array:title,body',
            'weeks.*.title' => 'required|string|max:191',
            'weeks.*.body' => 'required|string|max:10000',
        ];
    }
}
