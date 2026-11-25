<?php

namespace App\Http\Requests\Community;

use App\Services\Community\CommunityAudience;
use Illuminate\Foundation\Http\FormRequest;

final class StudyGroupRequest extends FormRequest
{
    public function authorize(CommunityAudience $audience): bool
    {
        return $audience->teachers($this->route('offering')->id)->whereKey($this->user()->id)->exists();
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:191'],
            'members' => ['sometimes', 'array', 'max:200'],
            'members.*' => ['required', 'uuid', 'distinct'],
        ];
    }
}
