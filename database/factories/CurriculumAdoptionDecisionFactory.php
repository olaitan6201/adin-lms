<?php

namespace Database\Factories;

use App\Enums\CurriculumStatus;
use App\Models\AcademicPathway;
use App\Models\AcademicSession;
use App\Models\Curriculum;
use App\Models\CurriculumAdoptionDecision;
use App\Models\EntryCohort;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<CurriculumAdoptionDecision>
 */
class CurriculumAdoptionDecisionFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'approved_by' => User::factory(),
            'academic_session_id' => AcademicSession::factory(),
            'entry_cohort_id' => EntryCohort::factory(),
            'curriculum_id' => fn (array $attributes): string => $this->approvedVersion($attributes['approved_by'])->id,
            'academic_pathway_id' => fn (array $attributes): string => Curriculum::findOrFail($attributes['curriculum_id'])->academic_pathway_id,
            'decision_reference' => 'DEC-'.fake()->uuid(),
            'reason' => fake()->sentence(),
            'recorded_at' => now(),
        ];
    }

    private function approvedVersion(string $actorId): Curriculum
    {
        $pathway = AcademicPathway::factory()->create();

        return Curriculum::factory()->create([
            'academic_pathway_id' => $pathway->id,
            'academic_programme_id' => $pathway->academic_programme_id,
            'status' => CurriculumStatus::Approved,
            'approved_by' => $actorId,
            'approved_at' => now(),
        ]);
    }
}
