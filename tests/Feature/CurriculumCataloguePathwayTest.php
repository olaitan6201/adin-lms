<?php

namespace Tests\Feature;

use App\Enums\CurriculumStatus;
use App\Models\AcademicPathway;
use App\Models\AcademicProgramme;
use App\Models\Course;
use App\Models\CourseOutcome;
use App\Models\Curriculum;
use App\Models\CurriculumCourse;
use App\Models\OutcomeMapping;
use App\Models\Prerequisite;
use App\Models\Programme;
use App\Models\ProgrammeOutcome;
use App\Models\Specialization;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia;
use Tests\Support\AcademicAccess;
use Tests\TestCase;

class CurriculumCataloguePathwayTest extends TestCase
{
    use AcademicAccess, RefreshDatabase;

    public function test_catalogue_lists_legacy_and_pathway_versions_under_their_source_names(): void
    {
        $this->academicUser('quality_assurance_officer');
        $legacy = Curriculum::factory()->for(Programme::factory()->state(['name' => 'Applied Mathematics']))->create();
        $linked = $this->linkedVersion();

        $this->get(route('academics.curriculum.show'))
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->component('Academics/Catalogue')
                ->where('version', null)
                ->where('edit', false)
                ->where('approve', false)
                ->where('versions', [
                    ['id' => $legacy->id, 'name' => 'Applied Mathematics', 'version' => 1, 'status' => 'draft'],
                    ['id' => $linked->id, 'name' => 'Data Engineering · Computing', 'version' => 3, 'status' => 'reviewed'],
                ])
                ->etc());
    }

    public function test_linked_selection_exposes_source_pathway_metadata_without_legacy_detail(): void
    {
        $this->academicUser('super_admin');
        $linked = $this->linkedVersion();
        $this->legacyDetails($linked);

        $this->get(route('academics.curriculum.show', $linked))
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->where('edit', true)
                ->where('approve', true)
                ->where('entries', [])
                ->where('courseOutcomes', [])
                ->where('programmeOutcomes', [])
                ->where('mappings', [])
                ->where('prerequisites', [])
                ->where('version', [
                    'id' => $linked->id,
                    'programme_id' => $linked->programme_id,
                    'version' => 3,
                    'status' => 'reviewed',
                    'framework_revision' => 'CCMAS 2023',
                    'approved_by' => null,
                    'approved_at' => null,
                    'academic_pathway_id' => $linked->academic_pathway_id,
                    'academic_programme_id' => $linked->academic_programme_id,
                    'pathway' => ['programme' => 'Computing', 'specialization' => 'Data Engineering'],
                ])
                ->etc());
    }

    public function test_legacy_selection_retains_curriculum_detail_and_actor_permissions(): void
    {
        $this->academicUser();
        $legacy = Curriculum::factory()->for(Programme::factory()->state(['name' => 'Applied Mathematics']))->create();
        $this->legacyDetails($legacy);

        $this->get(route('academics.curriculum.show', $legacy))
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->where('edit', true)
                ->where('approve', false)
                ->where('version.id', $legacy->id)
                ->where('version.programme_id', $legacy->programme_id)
                ->where('version.pathway', null)
                ->where('entries.0.title', 'Legacy curriculum entry')
                ->where('courseOutcomes.0.statement', 'Apply concepts')
                ->where('programmeOutcomes.0.statement', 'Solve problems')
                ->has('mappings', 1)
                ->has('prerequisites', 1)
                ->where('programmes', [['id' => $legacy->programme_id, 'name' => 'Applied Mathematics']])
                ->etc());
    }

    public function test_catalogue_forbids_an_authenticated_actor_without_catalogue_permission(): void
    {
        $this->academicUser('ict_admin');
        $linked = $this->linkedVersion();

        $this->get(route('academics.curriculum.show', $linked))->assertForbidden();
    }

    private function linkedVersion(): Curriculum
    {
        $pathway = AcademicPathway::factory()
            ->for(AcademicProgramme::factory()->state(['name' => 'Computing']), 'programme')
            ->for(Specialization::factory()->state(['name' => 'Data Engineering']))
            ->create();

        return Curriculum::factory()
            ->for(Programme::factory()->state(['name' => 'Unrelated Legacy Programme']))
            ->create([
                'academic_pathway_id' => $pathway->id,
                'academic_programme_id' => $pathway->academic_programme_id,
                'version' => 3,
                'status' => CurriculumStatus::Reviewed,
                'framework_revision' => 'CCMAS 2023',
            ]);
    }

    private function legacyDetails(Curriculum $version): void
    {
        $entry = CurriculumCourse::factory()->create([
            'curriculum_id' => $version->id,
            'title' => 'Legacy curriculum entry',
        ]);
        $courseOutcome = CourseOutcome::forceCreate([
            'curriculum_course_id' => $entry->id,
            'statement' => 'Apply concepts',
        ]);
        $programmeOutcome = ProgrammeOutcome::forceCreate([
            'curriculum_id' => $version->id,
            'statement' => 'Solve problems',
        ]);
        OutcomeMapping::forceCreate([
            'course_outcome_id' => $courseOutcome->id,
            'programme_outcome_id' => $programmeOutcome->id,
        ]);

        Prerequisite::forceCreate([
            'curriculum_course_id' => $entry->id,
            'required_course_id' => Course::factory()->create()->id,
        ]);
    }
}
