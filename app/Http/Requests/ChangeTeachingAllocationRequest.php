<?php

namespace App\Http\Requests;

use App\Enums\AllocationOperation;
use App\Enums\PermissionCode;
use App\Services\Authority\ScopedAuthority;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ChangeTeachingAllocationRequest extends FormRequest
{
    public function authorize(ScopedAuthority $authority): bool
    {
        return $authority->institutionAllows($this->user(), PermissionCode::StaffManage);
    }

    public function rules(): array
    {
        return [
            'staff_number' => ['required', 'string', 'exists:lecturers,staff_number'],
            'offering' => ['required', 'string', 'exists:offerings,external_offering_id'],
            'operation' => ['required', Rule::enum(AllocationOperation::class)],
        ];
    }
}
