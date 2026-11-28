<?php

namespace Tests\Feature;

use App\Enums\CurriculumStatus;
use App\Models\AcademicPathway;
use App\Models\Course;
use App\Models\Curriculum;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia;
use Tests\Support\AcademicAccess;
use Tests\TestCase;

final class AcademicCoreWorkspaceTest extends TestCase
{
    use AcademicAccess, RefreshDatabase;

    public function test_admin_workspace_has_real_empty_state_and_actor_permissions(): void
    {
        $this->academicUser();

        $this->get(route('admin.academic-core'))->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->component('Admin/AcademicCore')
                ->where('edit', true)
                ->where('approve', false)
                ->where('courses', [])
                ->where('curricula', [])
                ->where('course', null)
                ->where('curriculum', null)
                ->where('actions.revisionStore', null)
                ->where('links.legacyCatalogue', route('academics.curriculum.show', absolute: false))
                ->etc());
    }

    public function test_workspace_lists_only_pathway_versions_and_never_opens_legacy_as_a_pathway(): void
    {
        $this->academicUser('quality_assurance_officer');
        $legacy = Curriculum::factory()->create();
        $pathway = AcademicPathway::factory()->create();
        $version = Curriculum::factory()->create([
            'academic_pathway_id' => $pathway->id,
            'academic_programme_id' => $pathway->academic_programme_id,
            'status' => CurriculumStatus::Approved,
        ]);
        $course = Course::factory()->create();

        $this->get(route('admin.academic-core', ['curriculum' => $version->id, 'course' => $course->id]))
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->where('edit', false)
                ->where('approve', false)
                ->has('curricula', 1)
                ->where('curricula.0.id', $version->id)
                ->where('curriculum.id', $version->id)
                ->where('curriculum.status', 'approved')
                ->where('course.id', $course->id)
                ->where('course.revisions', [])
                ->etc());
        $this->get(route('admin.academic-core', ['curriculum' => $legacy->id]))->assertNotFound();
    }

    public function test_workspace_denies_actors_without_institutional_curriculum_permission(): void
    {
        $this->getJson(route('admin.academic-core'))->assertUnauthorized();
        $this->academicUser('ict_admin');

        $this->get(route('admin.academic-core'))->assertForbidden();
    }
}
