<?php

namespace Database\Factories;

use App\Models\AcademicLevel;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<AcademicLevel> */
class AcademicLevelFactory extends Factory
{
    public function definition(): array
    {
        return [
            'label' => 'Level '.fake()->unique()->numerify('######'),
        ];
    }
}
