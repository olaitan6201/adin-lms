<?php

namespace App\Http\Resources\Assessment;

use App\Models\GradeInput;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin GradeInput */
class GradeInputResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'item' => $this->score->item->title,
            'score_revision' => $this->score->revision,
            'points' => (string) $this->score->points,
            'maximum' => (string) $this->maximum_score,
            'weight' => (string) $this->applied_weight,
        ];
    }
}
