<?php

namespace Database\Factories;

use App\Enums\EnrolmentStatus;
use App\Models\Enrolment;
use App\Models\Offering;
use App\Models\Student;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<Enrolment> */
class EnrolmentFactory extends Factory
{
    public function definition(): array
    {
        return [
            'student_id' => Student::factory(),
            'offering_id' => Offering::factory(),
            'status' => EnrolmentStatus::Registered,
            'source_revision' => 1,
            'enrolled_at' => now(),
        ];
    }

    public function withdrawn(): static
    {
        return $this->state(['status' => EnrolmentStatus::Withdrawn, 'source_revision' => 2]);
    }
}
