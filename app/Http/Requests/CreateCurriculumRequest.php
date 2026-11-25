<?php

namespace App\Http\Requests;

use App\Services\Authority\ScopedAuthority;
use Illuminate\Foundation\Http\FormRequest;

class CreateCurriculumRequest extends FormRequest
{
    public function authorize(ScopedAuthority $authority): bool
    {
        return $authority->institutionAllows($this->user(), 'curriculum.edit');
    }

    public function rules(): array
    {
        return [
            'programme_id' => 'required|uuid|exists:programmes,id',
            'framework_revision' => 'required|string|max:191',
        ];
    }
}
