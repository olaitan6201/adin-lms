<?php

namespace Database\Factories;

use App\Models\LearningMaterial;
use App\Models\MaterialVersion;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<MaterialVersion> */
class MaterialVersionFactory extends Factory
{
    public function definition(): array
    {
        return [
            'material_id' => LearningMaterial::factory(),
            'revision' => 1,
            'body' => fake()->paragraph(),
            'created_at' => now(),
            'created_by' => User::factory(),
        ];
    }
}
