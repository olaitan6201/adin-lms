<?php

namespace App\Http\Resources\Assessment;

use App\Models\AttemptQuestion;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin AttemptQuestion */
class CandidateQuestionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $response = $this->latestResponse;

        return [
            'id' => $this->id,
            'prompt' => $this->version->prompt,
            'options' => $this->option_order,
            'value' => $response?->answer['value'] ?? '',
            'revision' => $response?->revision ?? 0,
        ];
    }
}
