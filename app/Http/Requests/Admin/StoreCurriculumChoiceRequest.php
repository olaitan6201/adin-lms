<?php

namespace App\Http\Requests\Admin;

final class StoreCurriculumChoiceRequest extends PathwayCurriculumEditRequest
{
    public function rules(): array
    {
        return [
            'code' => ['bail', 'required', 'string', 'max:191', 'not_regex:/\x00/'],
            'minimum_selections' => ['required', 'integer', 'min:0', 'lte:maximum_selections'],
            'maximum_selections' => ['required', 'integer', 'min:1', 'max:500'],
            'curriculum_course_ids' => ['required', 'array', 'list', 'min:1', 'max:500'],
            'curriculum_course_ids.*' => ['required', 'uuid', 'distinct:ignore_case'],
        ];
    }
}
