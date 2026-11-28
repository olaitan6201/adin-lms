<?php

namespace Tests\Feature;

use App\Enums\CurriculumStatus;
use App\Models\Curriculum;
use App\Models\CurriculumCourse;
use App\Models\Offering;
use App\Models\Semester;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Support\AcademicAccess;
use Tests\Support\BuildsCoreCompatibilityGraph;
use Tests\TestCase;

class AcademicCoreLegacyCompatibilityTest extends TestCase
{
    use AcademicAccess, BuildsCoreCompatibilityGraph, RefreshDatabase;

    public function test_delivery_lists_and_accepts_only_approved_legacy_assignments(): void
    {
        $this->academicUser();
        $legacy = Curriculum::factory()->create(['status' => CurriculumStatus::Approved]);
        $legacyEntry = CurriculumCourse::factory()->create(['curriculum_id' => $legacy->id]);
        $draftEntry = CurriculumCourse::factory()->create();
        $projected = $this->pathwayVersion(CurriculumStatus::Approved, $legacy->programme_id);
        $projectedEntry = $this->fullAssignment($projected, retainLegacyFields: true);
        $partialHistoryEntry = CurriculumCourse::factory()->create(['curriculum_id' => $projected->id]);
        $pathwayEntry = $this->fullAssignment($this->pathwayVersion(CurriculumStatus::Approved));
        $offering = Offering::factory()->create();
        $term = Semester::factory()->create();

        $entries = $this->get('/academics/delivery')->assertOk()->viewData('page')['props']['entries'];
        $this->assertSame([$legacyEntry->id], array_column($entries, 'id'));

        $path = "/academics/delivery/{$offering->id}/prepare";
        $details = ['semester_id' => $term->id, 'section' => 'A', 'delivery_mode' => 'online'];
        foreach ([$draftEntry, $projectedEntry, $partialHistoryEntry, $pathwayEntry] as $ineligible) {
            $this->post($path, ['curriculum_course_id' => $ineligible->id] + $details)
                ->assertSessionHasErrors('curriculum_course_id');
            $this->assertDatabaseHas('offerings', ['id' => $offering->id, 'curriculum_course_id' => null]);
        }

        $this->post($path, ['curriculum_course_id' => $legacyEntry->id] + $details)->assertSessionHasNoErrors();
        $this->assertDatabaseHas('offerings', ['id' => $offering->id, 'curriculum_course_id' => $legacyEntry->id]);
    }

    public function test_legacy_qa_and_approval_insights_exclude_linked_versions_even_when_projections_exist(): void
    {
        $approved = Curriculum::factory()->create(['status' => CurriculumStatus::Approved]);
        $reviewed = Curriculum::factory()->create(['status' => CurriculumStatus::Reviewed]);
        $this->pathwayVersion(CurriculumStatus::Approved, $approved->programme_id);
        $linkedReviewed = $this->pathwayVersion(CurriculumStatus::Reviewed, $reviewed->programme_id);
        $this->pathwayVersion(CurriculumStatus::Approved);
        $this->pathwayVersion(CurriculumStatus::Reviewed);

        $this->academicUser('quality_assurance_officer');
        $qa = $this->get('/admin/qa')->assertOk()->viewData('page')['props'];
        $this->assertSame(1, $qa['approvedCount']);
        $this->assertSame(1, $qa['reviewedCount']);
        $this->assertSame([route('academics.curriculum.show', $approved, false)], array_column($qa['evidence'], 'href'));
        $this->assertSame([route('academics.curriculum.show', $reviewed, false)], array_column($qa['queue'], 'href'));

        $this->academicUser('super_admin');
        $dashboard = $this->get('/dashboard')->assertOk()->viewData('page')['props'];
        $this->assertContains(route('academics.curriculum.show', $reviewed, false), array_column($dashboard['queue'], 'href'));
        $this->assertNotContains(route('academics.curriculum.show', $linkedReviewed, false), array_column($dashboard['queue'], 'href'));
    }
}
