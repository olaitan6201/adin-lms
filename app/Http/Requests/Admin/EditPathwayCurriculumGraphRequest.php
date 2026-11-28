<?php

namespace App\Http\Requests\Admin;

final class EditPathwayCurriculumGraphRequest extends PathwayCurriculumEditRequest
{
    public function rules(): array
    {
        $id = ['required', 'uuid'];
        $entry = ['entry_id' => $id];
        $statement = ['statement' => ['bail', 'required', 'string', 'max:5000', 'not_regex:/\x00/']];

        return match ($this->route()->getActionMethod()) {
            'prerequisite' => $entry + ['required_entry_id' => [...$id, 'different:entry_id']],
            'courseOutcome' => $entry + $statement,
            'programmeOutcome' => $statement,
            'mapping' => ['course_outcome_id' => $id, 'programme_outcome_id' => $id],
        };
    }
}
