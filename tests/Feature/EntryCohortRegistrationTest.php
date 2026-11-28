<?php

namespace Tests\Feature;

use App\Models\EntryCohort;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Support\AcademicAccess;
use Tests\TestCase;

class EntryCohortRegistrationTest extends TestCase
{
    use AcademicAccess, RefreshDatabase;

    public function test_institutional_editor_can_record_an_explicit_cohort(): void
    {
        $this->academicUser();

        $this->post('/admin/academic-core/cohorts', ['code' => 'INTAKE-A', 'label' => 'First intake'])
            ->assertRedirectToRoute('admin.academic-core')
            ->assertSessionHasNoErrors();

        $cohort = EntryCohort::sole();
        $this->assertSame(7, (int) $cohort->getKey()[14]);
        $this->assertSame('INTAKE-A', $cohort->code);
        $this->assertSame('First intake', $cohort->label);
    }

    public function test_compliance_reader_cannot_create_a_cohort(): void
    {
        $this->academicUser('quality_assurance_officer');

        $this->post('/admin/academic-core/cohorts', ['code' => 'INTAKE-A', 'label' => 'First intake'])
            ->assertForbidden();

        $this->assertDatabaseEmpty('entry_cohorts');
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
