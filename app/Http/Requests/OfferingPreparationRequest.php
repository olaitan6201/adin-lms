<?php

namespace App\Http\Requests;

use App\Services\Academics\OfferingLifecycle;
use App\Services\Authority\ScopedAuthority;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class OfferingPreparationRequest extends FormRequest
{
    public function authorize(ScopedAuthority $authority): bool
    {
        return $authority->institutionAllows($this->user(), 'offerings.manage');
    }

    public function rules(): array
    {
        return match ($this->route('action')) {
            'prepare' => [
                'curriculum_course_id' => 'required|uuid|exists:curriculum_courses,id',
                'semester_id' => 'required|uuid|exists:semesters,id',
                'section' => 'required|string|max:191',
                'delivery_mode' => ['required', Rule::in(OfferingLifecycle::MODES)],
            ],
            'copy' => ['source_id' => 'required|uuid|exists:offerings,id'],
            default => [],
        };
    }
}
