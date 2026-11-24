<?php

namespace Database\Factories;

use App\Models\Module;
use App\Models\Offering;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<Module> */
class ModuleFactory extends Factory
{
    public function definition(): array
    {
        return [
            'offering_id' => Offering::factory(),
            'position' => 1,
            'kind' => 'chapter',
            'title' => fake()->sentence(4),
            'body' => fake()->paragraph(),
        ];
    }
}
