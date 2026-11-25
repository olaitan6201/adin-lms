<?php

namespace App\Http\Requests;

use App\Enums\PermissionCode;
use App\Services\Authority\ScopedAuthority;
use Illuminate\Foundation\Http\FormRequest;

class ApproveGuardianRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(ScopedAuthority $authority): bool
    {
        return $authority->institutionAllows($this->user(), PermissionCode::GrantsManage);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, string>
     */
    public function rules(): array
    {
        return [
            'guardian_email' => 'required|email|max:191',
            'student_reference' => 'required|string|max:191|exists:students,external_student_id',
            'confirmed' => 'accepted',
        ];
    }
}
