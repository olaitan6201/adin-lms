<?php

namespace App\Http\Requests\Admin;

use App\Enums\PermissionCode;
use App\Services\Authority\ScopedAuthority;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;

final class StoreCurriculumAdoptionRequest extends FormRequest
{
    public function authorize(ScopedAuthority $authority): bool
    {
        return $this->user() !== null
            && $authority->institutionAllows($this->user(), PermissionCode::CurriculumApprove);
    }

    protected function prepareForValidation(): void
    {
        foreach (['curriculum_id', 'academic_session_id', 'entry_cohort_id'] as $key) {
            $value = $this->input($key);
            if (is_string($value) && Str::isUuid($value)) {
                $this->merge([$key => strtolower($value)]);
            }
        }
    }

    public function rules(): array
    {
        return [
            'curriculum_id' => ['bail', 'required', 'uuid', 'exists:curricula,id'],
            'academic_session_id' => ['bail', 'required', 'uuid', 'exists:academic_sessions,id'],
            'entry_cohort_id' => ['bail', 'required', 'uuid', 'exists:entry_cohorts,id'],
            'decision_reference' => ['required', 'string', 'max:191'],
            'reason' => ['required', 'string', 'max:2000'],
        ];
    }
}
