<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

final class AcademicCourseRevisionRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'title' => ['bail', 'required', 'string', 'max:191', 'not_regex:/\x00/'],
            'description' => ['bail', 'required', 'string', 'max:16000', 'not_regex:/\x00/'],
            'syllabus' => ['bail', 'nullable', 'string', 'max:16000', 'not_regex:/\x00/'],
            'learning_outcomes' => ['bail', 'nullable', 'string', 'max:16000', 'not_regex:/\x00/'],
            'standard_units' => ['bail', 'required', 'string', 'regex:/\A[0-9]{1,16}(?:\.[0-9]{1,8})?\z/'],
        ];
    }

    public function messages(): array
    {
        return [
            'standard_units.string' => 'Enter the standard units as a decimal text value.',
            'standard_units.regex' => 'Enter a non-negative decimal with up to 16 whole digits and 8 decimal places.',
        ];
    }
}
