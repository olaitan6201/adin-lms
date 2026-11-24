<?php

namespace Database\Factories;

use App\Models\Lecturer;
use App\Models\Offering;
use App\Models\TeachingAllocation;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<TeachingAllocation> */
class TeachingAllocationFactory extends Factory
{
    public function definition(): array
    {
        return [
            'lecturer_id' => Lecturer::factory(),
            'offering_id' => Offering::factory(),
        ];
    }
}
