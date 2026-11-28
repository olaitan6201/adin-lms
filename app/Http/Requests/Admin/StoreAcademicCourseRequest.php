<?php

namespace App\Http\Requests\Admin;

use App\Models\Course;
use App\Models\Department;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

final class StoreAcademicCourseRequest extends FormRequest
{
    protected function prepareForValidation(): void
    {
        $department = $this->input('department_id');
        if (is_string($department) && Str::isUuid($department)) {
            $this->merge(['department_id' => strtolower($department)]);
        }
    }

    public function rules(): array
    {
        return [
            'department_id' => ['bail', 'required', 'uuid', Rule::exists(Department::class, 'id')],
            'code' => ['bail', 'required', 'string', 'max:191', 'not_regex:/\x00/', Rule::unique(Course::class, 'code')],
        ];
    }
}
