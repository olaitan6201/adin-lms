<?php

namespace App\Http\Requests\Assessment;

use App\Enums\Assessment\ItemKind;
use App\Enums\Assessment\RoundingRule;
use App\Models\Gradebook;
use App\Models\Offering;
use App\Services\Assessment\AssessmentPolicy;
use App\Services\Assessment\GradebookPolicyAccess;
use Illuminate\Contracts\Validation\Validator as ValidatorContract;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Illuminate\Validation\Validator;

class GradebookSetupRequest extends FormRequest
{
    public function authorize(GradebookPolicyAccess $access): bool
    {
        $offering = $this->route('offering');

        return $offering instanceof Offering
            && $access->allows($this->user(), $offering, Gradebook::where('offering_id', $offering->id)->first());
    }

    public function rules(): array
    {
        return [
            'rounding' => ['required', Rule::enum(RoundingRule::class)->except(RoundingRule::None)],
            'boundaries' => 'required|array|min:1|max:40',
            'boundaries.*.minimum' => 'required|decimal:0,8|between:0,100|distinct',
            'boundaries.*.grade' => 'required|string|max:30',
            'items' => 'required|array|min:1|max:100',
            'items.*.id' => ['nullable', 'uuid'],
            'items.*.title' => 'required|string|max:191',
            'items.*.kind' => ['required', Rule::enum(ItemKind::class)],
            'items.*.weight' => 'required|decimal:0,8|between:0,100',
            'items.*.maximum' => 'required|decimal:0,8|gt:0|max:1000000',
            'items.*.rubric' => 'nullable|string|max:10000',
            'items.*.criteria' => 'nullable|array|min:1|max:50',
            'items.*.criteria.*.title' => 'required|string|max:191',
            'items.*.criteria.*.description' => 'nullable|string|max:5000',
            'items.*.criteria.*.levels' => 'required|array|min:2|max:20',
            'items.*.criteria.*.levels.*.label' => 'required|string|max:100',
            'items.*.criteria.*.levels.*.points' => 'required|decimal:0,8|between:0,1000000',
            'items.*.criteria.*.levels.*.description' => 'nullable|string|max:5000',
            'reason' => 'nullable|string|max:2000',
        ];
    }

    /** @return list<callable(Validator):void> */
    public function after(): array
    {
        return [function (Validator $validator): void {
            if ($validator->errors()->isNotEmpty()) {
                return;
            }
            try {
                AssessmentPolicy::normalize($validator->getData());
            } catch (ValidationException $exception) {
                foreach ($exception->errors() as $key => $messages) {
                    $validator->errors()->add($key, $messages[0]);
                }
            }
            $offering = $this->route('offering');
            $exists = $offering instanceof Offering && Gradebook::where('offering_id', $offering->id)->exists();
            if ($exists && blank($validator->getData()['reason'] ?? null)) {
                $validator->errors()->add('reason', 'Explain why the approved policy is being amended.');
            }
        }];
    }

    protected function failedValidation(ValidatorContract $validator): void
    {
        if (! $this->expectsJson()) {
            throw new ValidationException($validator, back()->withErrors($validator));
        }
        parent::failedValidation($validator);
    }
}
