<?php

namespace App\Http\Requests\Operations;

use App\Enums\BackupOutcome;
use Illuminate\Validation\Rule;

final class BackupEvidenceRequest extends CaseReferenceRequest
{
    public function rules(): array
    {
        return parent::rules() + ['outcome' => ['required', Rule::enum(BackupOutcome::class)]];
    }
}
