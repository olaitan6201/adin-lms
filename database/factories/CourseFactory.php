<?php

namespace Database\Factories;

use App\Models\Course;
use App\Models\Department;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<Course> */
class CourseFactory extends Factory
{
    public function definition(): array
    {
        return [
            'department_id' => Department::factory(),
            'code' => 'CRS-'.fake()->unique()->uuid(),
        ];
    }
}
