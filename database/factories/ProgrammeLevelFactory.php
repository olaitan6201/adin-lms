<?php

namespace Database\Factories;

use App\Models\AcademicProgramme;
use App\Models\ProgrammeLevel;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ProgrammeLevel>
 */
class ProgrammeLevelFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'academic_programme_id' => AcademicProgramme::factory(),
            'code' => '100',
            'label' => 'Year one',
            'position' => 1,
        ];
    }
}
