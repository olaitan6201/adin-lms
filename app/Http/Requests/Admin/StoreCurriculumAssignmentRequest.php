<?php

namespace App\Http\Requests\Admin;

use App\Enums\CurriculumCourseCategory;
use App\Enums\CurriculumRequirementMode;
use Illuminate\Validation\Rule;

final class StoreCurriculumAssignmentRequest extends PathwayCurriculumEditRequest
{
    public function rules(): array
    {
        return [
            'course_revision_id' => ['required', 'uuid'],
            'programme_level_id' => ['required', 'uuid'],
            'category' => ['required', Rule::enum(CurriculumCourseCategory::class)],
            'requirement_mode' => ['required', Rule::enum(CurriculumRequirementMode::class)],
            'credits' => ['bail', 'required', 'string', 'regex:/\A[0-9]{1,4}(?:\.[0-9]{1,8})?\z/', 'numeric', 'gt:0', 'max:9999'],
            'semester_position' => ['required', 'integer', 'between:1,99'],
        ];
    }
}
