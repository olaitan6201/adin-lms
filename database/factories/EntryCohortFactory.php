<?php

namespace Database\Factories;

use App\Models\EntryCohort;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<EntryCohort>
 */
class EntryCohortFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'code' => 'COHORT-'.fake()->uuid(),
            'label' => fake()->words(3, true),
        ];
    }
}
