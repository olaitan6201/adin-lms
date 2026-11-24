<?php

namespace Database\Factories;

use App\Models\Offering;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<Offering> */
class OfferingFactory extends Factory
{
    public function definition(): array
    {
        return [
            'external_offering_id' => 'OFFER-'.fake()->unique()->uuid(),
            'status' => 'draft',
        ];
    }
}
