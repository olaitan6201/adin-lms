<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class AcademicHierarchyRequest extends FormRequest
{
    public function rules(): array
    {
        $type = $this->route('kind');
        $text = 'required|string|max:191';
        $unique = fn (string $table, string $field) => Rule::unique($table, $field)->ignore($this->route('record'));
        $dates = [
            'starts_on' => 'required|date_format:Y-m-d',
            'ends_on' => 'required|date_format:Y-m-d|after_or_equal:starts_on',
        ];
        $session = $this->input('session_id');
        $position = ['bail', 'required', 'integer', 'min:1', 'max:2147483647'];
        if ($type === 'semesters' && is_string($session) && Str::isUuid($session)) {
            $position[] = $unique('semesters', 'position')->where('session_id', $session);
        }

        return match ($type) {
            'faculties', 'departments', 'programmes' => [
                'name' => $text,
                'code' => ['required', 'string', 'max:191', $unique($type, 'code')],
            ] +
                match ($type) {
                    'departments' => ['faculty_id' => 'required|uuid|exists:faculties,id'],
                    'programmes' => ['department_id' => 'required|uuid|exists:departments,id'],
                    default => [],
                },
            'levels' => ['label' => ['required', 'string', 'max:191', $unique('academic_levels', 'label')]],
            'sessions' => ['label' => ['required', 'string', 'max:191', $unique('academic_sessions', 'label')]] + $dates,
            'semesters' => [
                'session_id' => 'bail|required|uuid|exists:academic_sessions,id',
                'position' => $position,
            ] + $dates,
        };
    }
}
