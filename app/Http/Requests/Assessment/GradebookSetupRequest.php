<?php

namespace App\Http\Requests\Assessment;

use App\Enums\Assessment\ItemKind;
use App\Enums\Assessment\RoundingRule;
use App\Policies\AssessmentItemPolicy;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class GradebookSetupRequest extends FormRequest
{
    public function authorize(AssessmentItemPolicy $access): bool
    {
        return $access->teaches($this->user(), $this->route('offering'));
    }

    public function rules(): array
    {
        return [
            'rounding' => ['required', Rule::enum(RoundingRule::class)->except(RoundingRule::None)],
            'boundaries' => 'required|array|min:1|max:40',
            'boundaries.*.minimum' => 'required|decimal:0,8|between:0,100|distinct',
            'boundaries.*.grade' => 'required|string|max:30',
            'items' => 'required|array|min:1|max:100',
            'items.*.title' => 'required|string|max:191',
            'items.*.kind' => ['required', Rule::enum(ItemKind::class)],
            'items.*.weight' => 'required|decimal:0,8|between:0,100',
            'items.*.maximum' => 'required|decimal:0,8|gt:0|max:1000000',
            'items.*.rubric' => 'nullable|string|max:10000',
        ];
    }
}
