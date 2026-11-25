<?php

namespace App\Http\Requests\Community;

final class SendMessageRequest extends CommunityBodyRequest
{
    public function rules(): array
    {
        return [...parent::rules(), 'recipient_id' => ['required', 'uuid']];
    }

    public function recipientId(): string
    {
        return $this->validated('recipient_id');
    }
}
