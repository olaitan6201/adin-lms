<?php

namespace App\Http\Requests\Learning;

use App\Enums\PermissionCode;
use App\Services\Authority\ScopedAuthority;
use Illuminate\Foundation\Http\FormRequest;

final class ReviewTeachingPlanRequest extends FormRequest
{
    public function authorize(ScopedAuthority $authority): bool
    {
        return $authority->institutionAllows($this->user(), PermissionCode::OfferingsManage);
    }

    public function rules(): array
    {
        return [
            'decision' => 'required|in:approved,rejected',
            'reason' => 'nullable|required_if:decision,rejected|string|max:2000',
        ];
    }
}
