<?php

namespace Database\Factories;

use App\Models\Department;
use App\Models\Programme;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<Programme> */
class ProgrammeFactory extends Factory
{
    public function definition(): array
    {
        return [
            'department_id' => Department::factory(),
            'code' => 'PRG-'.fake()->unique()->uuid(),
            'name' => 'BSc '.fake()->word(),
        ];
    }
}
