<?php

namespace Database\Factories;

use App\Models\AcademicPathway;
use App\Models\AcademicProgramme;
use App\Models\Specialization;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<AcademicPathway>
 */
class AcademicPathwayFactory extends Factory
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
            'specialization_id' => Specialization::factory(),
        ];
    }
}
