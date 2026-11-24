<?php

namespace Database\Factories;

use App\Models\AcademicLevel;
use App\Models\Course;
use App\Models\Curriculum;
use App\Models\CurriculumCourse;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<CurriculumCourse> */
class CurriculumCourseFactory extends Factory
{
    public function definition(): array
    {
        return [
            'curriculum_id' => Curriculum::factory(),
            'course_id' => Course::factory(),
            'title' => fake()->sentence(4),
            'description' => fake()->paragraph(),
            'credits' => '3.0',
            'level_id' => AcademicLevel::factory(),
            'semester_position' => 1,
            'compulsory' => true,
        ];
    }
}
