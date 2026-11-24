<?php

namespace Database\Factories;

use App\Models\Student;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<Student> */
class StudentFactory extends Factory
{
    public function definition(): array
    {
        return [
            'external_student_id' => 'STU-'.fake()->unique()->uuid(),
            'user_id' => User::factory(),
            'matric_number' => fake()->unique()->bothify('DEMO/########'),
            'status' => 'active',
        ];
    }
}
