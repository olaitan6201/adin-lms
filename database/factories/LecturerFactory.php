<?php

namespace Database\Factories;

use App\Models\Department;
use App\Models\Lecturer;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<Lecturer> */
class LecturerFactory extends Factory
{
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'staff_number' => 'STAFF-'.fake()->unique()->uuid(),
            'department_id' => Department::factory(),
        ];
    }
}
