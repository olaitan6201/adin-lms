<?php

namespace App\Http\Requests\ScormRuntime;

use App\Policies\LearningPolicy;
use App\Services\ScormRuntime\StaticOrigin;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

final class ImportReadingRequest extends FormRequest
{
    public function authorize(LearningPolicy $policy): bool
    {
        StaticOrigin::forRequest($this);
        abort_unless($policy->allocated($this->user()->id, $this->route('offering')), 404);

        return true;
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:160', Rule::unique('scorm_packages')->where('offering_id', $this->route('offering')->id)],
            'package' => ['required', 'file', 'max:128'],
        ];
    }
}
