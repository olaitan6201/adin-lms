<?php

namespace App\Http\Requests;

use App\Services\Authority\ScopedAuthority;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class AcademicHierarchyRequest extends FormRequest
{
    public function authorize(ScopedAuthority $authority): bool
    {
        return $authority->institutionAllows($this->user(), 'academics.manage');
    }

    public function rules(): array
    {
        $type = $this->route('kind');
        $text = 'required|string|max:191';
        $dates = [
            'starts_on' => 'required|date_format:Y-m-d',
            'ends_on' => 'required|date_format:Y-m-d|after_or_equal:starts_on',
        ];

        return match ($type) {
            'faculties', 'departments', 'programmes' => [
                'name' => $text,
                'code' => "$text|unique:$type,code",
            ] +
                match ($type) {
                    'departments' => ['faculty_id' => 'required|uuid|exists:faculties,id'],
                    'programmes' => ['department_id' => 'required|uuid|exists:departments,id'],
                    default => [],
                },
            'levels' => ['label' => "$text|unique:academic_levels,label"],
            'sessions' => ['label' => "$text|unique:academic_sessions,label"] + $dates,
            'semesters' => [
                'session_id' => 'required|uuid|exists:academic_sessions,id',
                'position' => [
                    'required',
                    'integer',
                    'min:1',
                    Rule::unique('semesters')->where('session_id', $this->string('session_id')->toString()),
                ],
            ] + $dates,
        };
    }
}
