<?php

namespace Tests\Feature;

use App\Models\AcademicPathway;
use App\Models\Curriculum;
use App\Models\Programme;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia;
use Tests\Support\AcademicAccess;
use Tests\TestCase;

class CurriculumCatalogueOrderingTest extends TestCase
{
    use AcademicAccess, RefreshDatabase;

    public function test_catalogue_orders_display_names_as_database_strings_and_newest_versions_first(): void
    {
        $this->academicUser('quality_assurance_officer');
        $ten = Programme::factory()->create(['name' => '10']);
        $tenFirst = Curriculum::factory()->for($ten)->create();
        $tenSecond = Curriculum::factory()->for($ten)->create(['version' => 2]);
        $two = Curriculum::factory()->for(Programme::factory()->state(['name' => '2']))->create();
        $pathway = AcademicPathway::factory()->create();
        $pathway->specialization->update(['name' => 'Analytics']);
        $pathway->programme->update(['name' => 'Diploma']);
        $linked = Curriculum::factory()
            ->for(Programme::factory()->state(['name' => '0']))
            ->create([
                'academic_pathway_id' => $pathway->id,
                'academic_programme_id' => $pathway->academic_programme_id,
            ]);

        $this->get(route('academics.curriculum.show'))
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page->where('versions', [
                ['id' => $tenSecond->id, 'name' => '10', 'version' => 2, 'status' => 'draft'],
                ['id' => $tenFirst->id, 'name' => '10', 'version' => 1, 'status' => 'draft'],
                ['id' => $two->id, 'name' => '2', 'version' => 1, 'status' => 'draft'],
                ['id' => $linked->id, 'name' => 'Analytics · Diploma', 'version' => 1, 'status' => 'draft'],
            ])->etc());
    }
}
