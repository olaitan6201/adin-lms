<?php

namespace Database\Factories;

use App\Models\CurriculumAdoption;
use App\Models\CurriculumAdoptionDecision;
use Closure;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<CurriculumAdoption>
 */
class CurriculumAdoptionFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'active_decision_id' => CurriculumAdoptionDecision::factory(),
            'academic_pathway_id' => $this->decisionAttribute('academic_pathway_id'),
            'academic_session_id' => $this->decisionAttribute('academic_session_id'),
            'entry_cohort_id' => $this->decisionAttribute('entry_cohort_id'),
        ];
    }

    private function decisionAttribute(string $column): Closure
    {
        return fn (array $attributes): string => CurriculumAdoptionDecision::findOrFail($attributes['active_decision_id'])->getAttribute($column);
    }
}
