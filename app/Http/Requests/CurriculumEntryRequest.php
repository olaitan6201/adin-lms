<?php

namespace App\Http\Requests;

use App\Services\Authority\ScopedAuthority;
use Illuminate\Foundation\Http\FormRequest;

class CurriculumEntryRequest extends FormRequest
{
    public function authorize(ScopedAuthority $authority): bool
    {
        return $authority->institutionAllows($this->user(), $this->route('action') === 'approve' ? 'curriculum.approve' : 'curriculum.edit');
    }

    public function rules(): array
    {
        $entry = ['entry_id' => 'required|uuid'];
        $statement = ['statement' => 'required|string|max:5000'];

        return match ($this->route('action')) {
            null => ['programme_id' => 'required|uuid|exists:programmes,id', 'framework_revision' => 'required|string|max:191'],
            'entry' => ['code' => 'required|string|max:191', 'title' => 'required|string|max:191', 'credits' => 'required|numeric|decimal:0,8|gt:0|max:9999',
                'description' => 'required|string|max:10000', 'outline' => 'required|string|max:32000', 'level_id' => 'required|uuid|exists:academic_levels,id',
                'semester_position' => 'required|integer|between:1,99', 'compulsory' => 'required|boolean'],
            'prerequisite' => $entry + ['required_entry_id' => 'required|uuid|different:entry_id'],
            'course-outcome' => $entry + $statement,
            'programme-outcome' => $statement,
            'mapping' => ['course_outcome_id' => 'required|uuid', 'programme_outcome_id' => 'required|uuid'],
            default => [],
        };
    }
}
