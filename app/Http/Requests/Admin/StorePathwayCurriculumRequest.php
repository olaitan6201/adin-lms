<?php

namespace App\Http\Requests\Admin;

final class StorePathwayCurriculumRequest extends PathwayCurriculumEditRequest
{
    public function rules(): array
    {
        return [
            'academic_pathway_id' => ['required', 'uuid'],
            'framework_revision' => ['bail', 'required', 'string', 'max:191', 'not_regex:/\x00/'],
        ];
    }
}
