<?php

namespace App\Http\Requests\Community;

use App\Models\Offering;
use App\Services\Community\CommunityAudience;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

final class CreateForumRequest extends FormRequest
{
    public function authorize(CommunityAudience $audience): bool
    {
        $offering = $this->route('offering');

        return $offering instanceof Offering
            && $audience->teachers($offering->id)->whereKey($this->user()->id)->exists();
    }

    public function rules(): array
    {
        $groupInCourse = Rule::exists('study_groups', 'id')->where(
            'offering_id',
            $this->route('offering')->id,
        );

        return [
            'title' => ['required', 'string', 'max:191'],
            'group_id' => ['nullable', 'uuid', $groupInCourse],
        ];
    }
}
