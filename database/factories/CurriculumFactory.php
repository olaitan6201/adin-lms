<?php

namespace Database\Factories;

use App\Models\Curriculum;
use App\Models\Programme;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<Curriculum> */
class CurriculumFactory extends Factory
{
    public function definition(): array
    {
        return [
            'programme_id' => Programme::factory(),
            'version' => 1,
            'status' => 'draft',
        ];
    }
}
