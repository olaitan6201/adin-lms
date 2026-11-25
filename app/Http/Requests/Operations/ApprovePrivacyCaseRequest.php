<?php

namespace App\Http\Requests\Operations;

use App\Enums\PrivacyOperation;
use Illuminate\Validation\Rule;

final class ApprovePrivacyCaseRequest extends CaseReferenceRequest
{
    public function rules(): array
    {
        return parent::rules() + ['operation' => ['required', Rule::enum(PrivacyOperation::class)]];
    }
}
