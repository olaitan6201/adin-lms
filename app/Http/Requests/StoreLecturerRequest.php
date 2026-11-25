<?php

namespace App\Http\Requests;

use App\Enums\PermissionCode;
use App\Services\Authority\ScopedAuthority;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreLecturerRequest extends FormRequest
{
    public function authorize(ScopedAuthority $authority): bool
    {
        return $authority->institutionAllows($this->user(), PermissionCode::StaffManage);
    }

    public function rules(): array
    {
        return [
            'staff_number' => ['required', 'string', 'max:191', 'unique:lecturers'],
            'user_id' => [
                'bail',
                'required',
                'uuid',
                Rule::exists('users', 'id')->where('status', 'active'),
                'unique:lecturers',
            ],
            'department_id' => ['bail', 'required', 'uuid', 'exists:departments,id'],
            'verified' => ['accepted'],
        ];
    }
}
