<?php

namespace App\Http\Requests\Community;

final class StorePostRequest extends CommunityBodyRequest
{
    public function rules(): array
    {
        return [...parent::rules(), 'parent_id' => ['nullable', 'uuid']];
    }

    public function parentId(): ?string
    {
        return $this->validated('parent_id');
    }
}
