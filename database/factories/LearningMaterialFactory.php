<?php

namespace Database\Factories;

use App\Models\LearningMaterial;
use App\Models\Module;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<LearningMaterial> */
class LearningMaterialFactory extends Factory
{
    public function definition(): array
    {
        return [
            'module_id' => Module::factory(),
            'title' => fake()->sentence(3),
            'download_allowed' => true,
        ];
    }
}
