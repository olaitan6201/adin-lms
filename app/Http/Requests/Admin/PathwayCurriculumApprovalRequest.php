<?php

namespace App\Http\Requests\Admin;

use App\Enums\PermissionCode;
use App\Services\Authority\ScopedAuthority;
use Illuminate\Foundation\Http\FormRequest;

final class PathwayCurriculumApprovalRequest extends FormRequest
{
    public function authorize(ScopedAuthority $authority): bool
    {
        $actor = $this->user();

        return $actor !== null && $authority->institutionAllows($actor, PermissionCode::CurriculumApprove);
    }

    public function rules(): array
    {
        return [];
    }
}
