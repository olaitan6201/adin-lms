<?php

namespace Database\Factories;

use App\Models\AcademicSession;
use App\Models\Semester;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<Semester> */
class SemesterFactory extends Factory
{
    public function definition(): array
    {
        return [
            'session_id' => AcademicSession::factory(),
            'position' => 1,
            'starts_on' => now()->startOfYear(),
            'ends_on' => now()->startOfYear()->addMonths(5),
        ];
    }
}
