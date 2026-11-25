<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class LoginEventResource extends JsonResource
{
    /**
     * @return array{id: string, user_id: ?string, occurred_at: string, outcome: string}
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'occurred_at' => $this->occurred_at->toISOString(),
            'outcome' => $this->outcome->value,
        ];
    }
}
