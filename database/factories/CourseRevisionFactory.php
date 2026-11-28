<?php

namespace Database\Factories;

use App\Enums\CurriculumStatus;
use App\Models\Course;
use App\Models\CourseRevision;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<CourseRevision> */
class CourseRevisionFactory extends Factory
{
    public function definition(): array
    {
        return [
            'course_id' => Course::factory(),
            'revision_number' => 1,
            'title' => fake()->sentence(3),
            'description' => fake()->paragraph(),
            'standard_units' => '3.00000000',
            'status' => CurriculumStatus::Draft,
        ];
    }

    public function reviewed(): static
    {
        return $this->state(['status' => CurriculumStatus::Reviewed]);
    }

    public function approved(?User $actor = null): static
    {
        return $this->state([
            'status' => CurriculumStatus::Approved,
            'approved_by' => $actor?->id ?? User::factory(),
            'approved_at' => now(),
        ]);
    }
}
