<?php

namespace App\Http\Requests\Admin;

use App\Enums\StructureRegisterKind;
use App\Models\AcademicPathway;
use App\Models\AcademicProgramme;
use App\Models\ProgrammeLevel;
use App\Models\Specialization;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Unique;

class StructureRegisterRequest extends FormRequest
{
    protected function prepareForValidation(): void
    {
        foreach (['academic_programme_id', 'department_id', 'specialization_id'] as $key) {
            $value = $this->input($key);
            if (is_string($value) && Str::isUuid($value)) {
                $this->merge([$key => strtolower($value)]);
            }
        }
    }

    public function rules(): array
    {
        $kind = StructureRegisterKind::from($this->route('kind'));
        $text = 'required|string|max:191';
        $programme = ['bail', 'required', 'uuid', 'exists:academic_programmes,id'];
        $department = 'bail|required|uuid|exists:departments,id';
        $specialization = 'bail|required|uuid|exists:specializations,id';
        $code = ['bail', 'required', 'string', 'max:191'];

        $rules = match ($kind) {
            StructureRegisterKind::Programme => [
                'code' => [...$code, ...$this->uniqueness(AcademicProgramme::class)],
                'name' => $text,
            ],
            StructureRegisterKind::Level => [
                'academic_programme_id' => $programme,
                'code' => [...$code, ...$this->uniqueness(ProgrammeLevel::class, scope: 'academic_programme_id')],
                'label' => $text,
                'position' => 'required|integer|min:1|max:2147483647',
            ],
            StructureRegisterKind::Specialization => [
                'department_id' => $department,
                'code' => [...$code, ...$this->uniqueness(Specialization::class, scope: 'department_id')],
                'name' => $text,
            ],
            StructureRegisterKind::Pathway => [
                'specialization_id' => $specialization,
                'academic_programme_id' => [...$programme, ...$this->uniqueness(AcademicPathway::class, 'academic_programme_id', 'specialization_id')],
            ],
        };

        if ($this->isMethod('patch')) {
            $rules['revision'] = ['required', 'string', 'regex:/^[a-f0-9]{64}$/'];
        }

        return $rules;
    }

    /** @return list<Unique> */
    private function uniqueness(string $model, string $field = 'code', ?string $scope = null): array
    {
        $unique = Rule::unique($model, $field);
        $record = $this->route('record');
        if (is_string($record)) {
            $unique->ignore(strtolower($record));
        }

        if ($scope === null) {
            return [$unique];
        }

        $parent = $this->input($scope);

        return is_string($parent) && Str::isUuid($parent) ? [$unique->where($scope, $parent)] : [];
    }
}
