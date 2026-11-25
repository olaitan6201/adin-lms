<?php

namespace Database\Factories;

use App\Models\AssessmentCriterionFeedback;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<AssessmentCriterionFeedback> */
class AssessmentCriterionFeedbackFactory extends Factory
{
    protected $model = AssessmentCriterionFeedback::class;

    public function definition(): array
    {
        return [
            'criterion_key' => (string) fake()->uuid(),
            'criterion_title' => fake()->sentence(3),
            'criterion_description' => null,
            'level_key' => (string) fake()->uuid(),
            'level_label' => fake()->word(),
            'level_description' => null,
            'points' => '0',
            'feedback' => null,
            'position' => 0,
        ];
    }
}
