<?php

namespace Tests\Feature;

use App\Enums\CurriculumStatus;
use App\Models\AcademicPathway;
use App\Models\Curriculum;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\Support\AcademicAccess;
use Tests\TestCase;

class CurriculumCompatibilityTest extends TestCase
{
    use AcademicAccess, RefreshDatabase;

    #[DataProvider('legacyActions')]
    public function test_legacy_actions_cannot_change_pathway_versions(
        string $action,
        CurriculumStatus $status,
        string $role,
        array $payload,
    ): void {
        $this->academicUser($role);
        $pathway = AcademicPathway::factory()->create();
        $version = Curriculum::factory()->create([
            'academic_pathway_id' => $pathway->id,
            'academic_programme_id' => $pathway->academic_programme_id,
            'status' => $status,
        ]);

        $this->post(route('academics.curriculum.change', [$version, $action]), $payload)
            ->assertSessionHasErrors(['status' => 'This version is linked to a pathway and cannot be changed here.']);

        $this->assertSame($status, $version->fresh()->status);
        $this->assertDatabaseCount('curricula', 1);
        $this->assertDatabaseCount('programme_outcomes', 0);
    }

    public static function legacyActions(): array
    {
        return [
            'edit' => ['programme-outcome', CurriculumStatus::Draft, 'institutional_admin', ['statement' => 'Legacy edit']],
            'review' => ['review', CurriculumStatus::Draft, 'institutional_admin', []],
            'approve' => ['approve', CurriculumStatus::Reviewed, 'super_admin', []],
            'fork' => ['fork', CurriculumStatus::Approved, 'institutional_admin', []],
        ];
    }
}
