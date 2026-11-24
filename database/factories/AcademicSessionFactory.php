<?php

namespace Database\Factories;

use App\Models\AcademicSession;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<AcademicSession> */
class AcademicSessionFactory extends Factory
{
    public function definition(): array
    {
        return [
            'label' => 'Session '.fake()->unique()->uuid(),
            'starts_on' => now()->startOfYear(),
            'ends_on' => now()->endOfYear(),
        ];
    }
}
