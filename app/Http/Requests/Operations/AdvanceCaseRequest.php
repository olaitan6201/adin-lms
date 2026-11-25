<?php

namespace App\Http\Requests\Operations;

use App\Enums\PrivacyCaseStage;
use Illuminate\Validation\Rule;

final class AdvanceCaseRequest extends CaseReferenceRequest
{
    public function rules(): array
    {
        return parent::rules() + ['stage' => ['required', Rule::enum(PrivacyCaseStage::class)]];
    }
}
