<?php

namespace Database\Factories;

use App\Models\AcademicProgramme;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<AcademicProgramme>
 */
class AcademicProgrammeFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'code' => strtoupper(fake()->unique()->lexify('AP????')),
            'name' => fake()->words(2, true),
        ];
    }
}
