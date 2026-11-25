<?php

namespace Database\Factories;

use App\Models\GradingPolicyItem;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<GradingPolicyItem> */
class GradingPolicyItemFactory extends Factory
{
    protected $model = GradingPolicyItem::class;

    public function definition(): array
    {
        return [
            'position' => 0,
            'title' => fake()->sentence(3),
            'kind' => 'assignment',
            'weight_percent' => '100',
            'maximum_score' => '10',
            'rubric' => null,
        ];
    }
}
