<?php

namespace App\Http\Requests\Admin;

use App\Enums\PermissionCode;
use App\Services\Authority\ScopedAuthority;
use Illuminate\Foundation\Http\FormRequest;

class PathwayCurriculumEditRequest extends FormRequest
{
    public function authorize(ScopedAuthority $authority): bool
    {
        $actor = $this->user();

        return $actor !== null && $authority->institutionAllows($actor, PermissionCode::CurriculumEdit);
    }

    public function rules(): array
    {
        return [];
    }
}
