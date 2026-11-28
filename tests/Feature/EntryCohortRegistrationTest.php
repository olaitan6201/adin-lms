<?php

namespace Tests\Feature;

use App\Enums\OrganisationAuditAction;
use App\Models\AuditLog;
use App\Models\EntryCohort;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Support\AcademicAccess;
use Tests\TestCase;

class EntryCohortRegistrationTest extends TestCase
{
    use AcademicAccess, RefreshDatabase;

    public function test_institutional_editor_can_record_an_explicit_cohort(): void
    {
        $actor = $this->academicUser();
        $this->freezeSecond();

        $this->post('/admin/academic-core/cohorts', ['code' => 'INTAKE-A', 'label' => 'First intake'])
            ->assertRedirectToRoute('admin.academic-core')
            ->assertSessionHasNoErrors();

        $cohort = EntryCohort::sole();
        $this->assertSame(7, (int) $cohort->getKey()[14]);
        $this->assertSame('INTAKE-A', $cohort->code);
        $this->assertSame('First intake', $cohort->label);
        $this->assertSame(now()->toDateTimeString(), $cohort->created_at?->toDateTimeString());
        $audit = AuditLog::where('subject_key', 'entry_cohorts:'.$cohort->id)->sole();
        $this->assertSame(OrganisationAuditAction::Created, $audit->organisation_action);
        $this->assertSame($actor->id, $audit->actor_id);
        $this->assertSame(now()->toDateTimeString(), $audit->occurred_at->toDateTimeString());
    }

    public function test_compliance_reader_cannot_create_a_cohort(): void
    {
        $this->academicUser('quality_assurance_officer');

        $this->post('/admin/academic-core/cohorts', ['code' => 'INTAKE-A', 'label' => 'First intake'])
            ->assertForbidden();

        $this->assertDatabaseEmpty('entry_cohorts');
        $this->assertFalse(AuditLog::where('subject_key', 'like', 'entry_cohorts:%')->exists());
    }

    public function test_incomplete_or_oversized_cohort_is_not_written(): void
    {
        $this->academicUser();

        $this->postJson('/admin/academic-core/cohorts', ['code' => str_repeat('x', 192)])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['code', 'label']);

        $this->assertDatabaseEmpty('entry_cohorts');
    }
}
