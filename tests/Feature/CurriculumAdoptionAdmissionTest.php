<?php

namespace Tests\Feature;

use App\Enums\CurriculumStatus;
use App\Models\AcademicPathway;
use App\Models\AcademicSession;
use App\Models\Curriculum;
use App\Models\EntryCohort;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\Support\AcademicAccess;
use Tests\TestCase;

class CurriculumAdoptionAdmissionTest extends TestCase
{
    use AcademicAccess, RefreshDatabase;

    public function test_edit_authority_does_not_grant_adoption_approval(): void
    {
        $this->academicUser();

        $this->postJson('/admin/academic-core/adoptions', $this->request($this->version(CurriculumStatus::Approved)))
            ->assertForbidden();

        $this->assertNoAdoptions();
    }

    #[DataProvider('ineligibleVersions')]
    public function test_only_approved_pathway_versions_can_be_adopted(CurriculumStatus $status, bool $hasPathway): void
    {
        $this->academicUser('super_admin');

        $this->postJson('/admin/academic-core/adoptions', $this->request($this->version($status, $hasPathway)))
            ->assertUnprocessable()
            ->assertJsonValidationErrors('curriculum_id');

        $this->assertNoAdoptions();
    }

    /** @return array<string, array{CurriculumStatus, bool}> */
    public static function ineligibleVersions(): array
    {
        return [
            'draft' => [CurriculumStatus::Draft, true],
            'reviewed' => [CurriculumStatus::Reviewed, true],
            'approved legacy' => [CurriculumStatus::Approved, false],
        ];
    }

    public function test_cannot_infer_a_missing_cohort_or_use_an_unknown_session(): void
    {
        $this->academicUser('super_admin');
        $request = $this->request($this->version(CurriculumStatus::Approved));
        unset($request['entry_cohort_id']);
        $request['academic_session_id'] = (string) Str::uuid7();

        $this->postJson('/admin/academic-core/adoptions', $request)
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['entry_cohort_id', 'academic_session_id']);

        $this->assertDatabaseCount('entry_cohorts', 1);
        $this->assertNoAdoptions();
    }

    private function version(CurriculumStatus $status, bool $hasPathway = true): Curriculum
    {
        $pathway = $hasPathway ? AcademicPathway::factory()->create() : null;

        return Curriculum::factory()->create([
            'academic_pathway_id' => $pathway?->id,
            'academic_programme_id' => $pathway?->academic_programme_id,
            'status' => $status,
            'approved_by' => $status === CurriculumStatus::Approved ? auth()->id() : null,
            'approved_at' => $status === CurriculumStatus::Approved ? now() : null,
        ]);
    }

    /** @return array<string, string> */
    private function request(Curriculum $curriculum): array
    {
        return [
            'curriculum_id' => $curriculum->id,
            'academic_session_id' => AcademicSession::factory()->create()->id,
            'entry_cohort_id' => EntryCohort::factory()->create()->id,
            'decision_reference' => 'BOARD-001',
            'reason' => 'Recorded institutional decision.',
        ];
    }

    private function assertNoAdoptions(): void
    {
        $this->assertDatabaseEmpty('curriculum_adoptions');
        $this->assertDatabaseEmpty('curriculum_adoption_decisions');
    }
}
