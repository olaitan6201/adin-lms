<?php

namespace Database\Factories;

use App\Models\Department;
use App\Models\Specialization;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Specialization>
 */
class SpecializationFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'department_id' => Department::factory(),
            'code' => strtoupper(fake()->unique()->lexify('SP????')),
            'name' => fake()->words(2, true),
        ];
    }
}
