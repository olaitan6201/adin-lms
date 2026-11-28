<?php

namespace App\Http\Requests\Admin;

use App\Enums\PermissionCode;
use App\Services\Authority\ScopedAuthority;
use Illuminate\Foundation\Http\FormRequest;

final class StoreEntryCohortRequest extends FormRequest
{
    public function authorize(ScopedAuthority $authority): bool
    {
        return $this->user() !== null
            && $authority->institutionAllows($this->user(), PermissionCode::CurriculumEdit);
    }

    public function rules(): array
    {
        return [
            'code' => ['required', 'string', 'max:191'],
            'label' => ['required', 'string', 'max:191'],
        ];
    }
}
