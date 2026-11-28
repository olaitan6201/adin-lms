<?php

namespace Tests\Feature;

use App\Enums\CurriculumStatus;
use App\Models\Curriculum;
use App\Models\CurriculumCourse;
use App\Models\Offering;
use Illuminate\Database\QueryException;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use LogicException;
use Tests\Support\BuildsCoreCompatibilityGraph;
use Tests\TestCase;

class AcademicCoreActivationSchemaTest extends TestCase
{
    use BuildsCoreCompatibilityGraph, RefreshDatabase;

    public function test_full_tuples_need_no_legacy_rows_and_keep_their_composite_keys(): void
    {
        $version = $this->pathwayVersion(CurriculumStatus::Draft);
        $assignment = $this->fullAssignment($version);
        $other = $this->pathwayVersion(CurriculumStatus::Draft);
        $otherLevel = $this->fullAssignment($other)->programme_level_id;

        $this->assertDatabaseCount('programmes', 0);
        $this->assertDatabaseCount('academic_levels', 0);
        $this->assertDatabaseHas('curricula', ['id' => $version->id, 'programme_id' => null]);
        $this->assertDatabaseHas('curriculum_courses', [
            'id' => $assignment->id,
            'title' => null,
            'description' => null,
            'level_id' => null,
            'compulsory' => null,
            'outline' => null,
            'credits' => '3.12500000',
        ]);
        $this->reject(fn () => $assignment->forceFill(['programme_level_id' => $otherLevel])->save(), 'foreign');
        $this->reject(fn () => $assignment->forceFill(['programme_level_id' => null])->save(), 'check');
        $this->reject(fn () => $version->forceFill(['academic_programme_id' => null])->save(), 'check');
    }

    public function test_legacy_inserts_and_updates_still_require_the_original_fields(): void
    {
        $version = Curriculum::factory()->create();
        $entry = CurriculumCourse::factory()->create(['curriculum_id' => $version->id]);

        $this->reject(fn () => Curriculum::factory()->create(['programme_id' => null]), 'check');
        $this->reject(fn () => $version->forceFill(['programme_id' => null])->save(), 'check');

        foreach (['title', 'description', 'level_id', 'compulsory'] as $column) {
            $this->reject(fn () => CurriculumCourse::factory()->create([
                'curriculum_id' => $version->id,
                $column => null,
            ]), 'check');
            $this->reject(fn () => $entry->fresh()->forceFill([$column => null])->save(), 'check');
        }

        $this->assertDatabaseHas('curriculum_courses', ['id' => $entry->id, 'title' => $entry->title]);
        $this->assertDatabaseHas('curricula', ['id' => $version->id, 'programme_id' => $version->getRawOriginal('programme_id')]);
    }

    public function test_deletes_and_legacy_publication_checks_survive_activation(): void
    {
        $legacy = CurriculumCourse::factory()->create();
        $offering = Offering::factory()->create(['curriculum_course_id' => $legacy->id]);

        $this->reject(fn () => $legacy->curriculum->delete(), 'foreign');
        $this->reject(fn () => $legacy->delete(), 'foreign');
        $this->reject(fn () => $offering->forceFill(['status' => 'published'])->save(), 'check');

        $this->assertDatabaseHas('offerings', ['id' => $offering->id, 'status' => 'draft', 'curriculum_course_id' => $legacy->id]);
    }

    public function test_rollback_refuses_to_change_new_only_records(): void
    {
        $version = $this->pathwayVersion(CurriculumStatus::Draft);
        $entry = $this->fullAssignment($version);
        $migration = require database_path('migrations/2026_11_28_000039_activate_academic_core_legacy_compatibility.php');

        try {
            $migration->down();
            $this->fail('Expected a forward-only migration.');
        } catch (LogicException $error) {
            $this->assertStringContainsString('forward-only', $error->getMessage());
        }

        $this->assertDatabaseHas('curricula', ['id' => $version->id, 'programme_id' => null]);
        $this->assertDatabaseHas('curriculum_courses', ['id' => $entry->id, 'level_id' => null]);
    }

    private function reject(callable $write, string $kind): void
    {
        try {
            DB::transaction($write);
            $this->fail("Expected the {$kind} constraint to reject the write.");
        } catch (QueryException $error) {
            match (DB::getDriverName()) {
                'pgsql' => $this->assertSame($kind === 'check' ? '23514' : '23503', $error->errorInfo[0]),
                'mysql' => $this->assertContains(
                    $error->errorInfo[1],
                    $kind === 'check' ? [3819] : [1451, 1452],
                ),
                'sqlite' => $this->assertMatchesRegularExpression(
                    $kind === 'check' ? '/^(Missing required legacy curriculum fields|Incomplete academic core tuple|Invalid offerings row)/' : '/^FOREIGN KEY constraint failed/',
                    $error->errorInfo[2],
                ),
                default => $this->fail('Unexpected test database engine.'),
            };
        }
    }
}
