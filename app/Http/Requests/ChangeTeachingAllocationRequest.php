<?php

namespace App\Http\Requests;

use App\Services\Authority\ScopedAuthority;
use Illuminate\Foundation\Http\FormRequest;

class ChangeTeachingAllocationRequest extends FormRequest
{
    public function authorize(ScopedAuthority $authority): bool
    {
        return $authority->institutionAllows($this->user(), 'staff.manage');
    }

    public function rules(): array
    {
        return [
            'staff_number' => ['required', 'string', 'exists:lecturers,staff_number'],
            'offering' => ['required', 'string', 'exists:offerings,external_offering_id'],
            'operation' => ['required', 'in:assign,remove'],
        ];
    }
}
