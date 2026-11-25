<?php

namespace App\Http\Requests\Assessment;

use App\Models\SubmissionVersion;
use App\Services\Assessment\ScoredRubric;
use Brick\Math\BigDecimal;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\ValidationException;
use Illuminate\Validation\Validator;

class SubmissionMarkRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'points' => 'nullable|decimal:0,8|min:0',
            'reason' => 'required|string|max:2000',
            'release' => 'nullable|boolean',
            'feedback' => 'nullable|string|max:30000',
            'script' => AssessmentUpload::RULE,
            'selections' => 'nullable|array|min:1|max:50',
            'selections.*' => 'required|array',
            'selections.*.criterion' => 'required|uuid',
            'selections.*.level' => 'required|uuid',
            'selections.*.feedback' => 'nullable|string|max:10000',
        ];
    }

    public function after(): array
    {
        return [function (Validator $validator): void {
            if ($validator->errors()->isNotEmpty()) {
                return;
            }
            $version = $this->route('version');
            if (! $version instanceof SubmissionVersion) {
                return;
            }
            $item = $version->submission->assignment->item;
            $data = $validator->getData();
            $rubric = $item->rubric['criteria'] ?? [];
            if ($rubric !== []) {
                if (($data['points'] ?? null) !== null) {
                    $validator->errors()->add('points', 'Rubric marks derive points from the selected levels.');
                }
                if (($data['selections'] ?? null) === null) {
                    $validator->errors()->add('selections', 'Select a level for every rubric criterion.');
                } else {
                    try {
                        app(ScoredRubric::class)->score($item->rubric, $data['selections']);
                    } catch (ValidationException $exception) {
                        $validator->errors()->add('selections', $exception->errors()['selections'][0]);
                    }
                }

                return;
            }
            if (($data['points'] ?? null) === null) {
                $validator->errors()->add('points', 'Enter the total points for this item.');
            }
            if (($data['selections'] ?? null) !== null) {
                $validator->errors()->add('selections', 'This item does not use a scored rubric.');
            }
            if (($data['points'] ?? null) !== null
                && BigDecimal::of((string) $data['points'])->isGreaterThan((string) $item->maximum_score)) {
                $validator->errors()->add('points', 'Points exceed the item maximum.');
            }
        }];
    }
}
