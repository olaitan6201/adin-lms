<?php

namespace App\Http\Requests\Operations;

use App\Enums\PrivacyCaseKind;
use Illuminate\Validation\Rule;

final class OpenCaseRequest extends CaseReferenceRequest
{
    public function rules(): array
    {
        $rules = parent::rules();
        $rules['reference'][] = Rule::unique('privacy_case_files', 'reference');

        return $rules + [
            'kind' => ['required', Rule::enum(PrivacyCaseKind::class)],
            'subject_id' => ['nullable', 'required_unless:kind,breach', 'uuid', 'exists:users,id'],
        ];
    }
}
