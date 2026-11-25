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
        $matching = $this->version->marking_key['matching'] ?? null;
        $data = [
            'id' => $this->id,
            'kind' => $this->version->kind->value,
            'prompt' => $this->version->prompt,
            'options' => $matching ? [] : $this->option_order,
            'value' => $response?->answer['value'] ?? '',
            'revision' => $response?->revision ?? 0,
        ];
        if ($matching) {
            $data['matching'] = [
                'left' => $this->items($matching['left'], $this->option_order['left']),
                'right' => $this->items($matching['right'], $this->option_order['right']),
            ];
        }

        return $data;
    }

    private function items(array $items, array $order): array
    {
        $labels = array_column($items, 'label', 'id');

        return array_map(fn (string $id): array => ['id' => $id, 'label' => $labels[$id]], $order);
    }
}
