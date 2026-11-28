<?php

namespace Tests\Feature;

use App\Models\CurriculumAdoption;
use App\Models\PlacementUpdate;
use App\Models\ProgrammeLevel;
use App\Models\Student;
use App\Services\Academics\OfficialPlacementRegister;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Inertia\Testing\AssertableInertia;
use Tests\Support\AcademicAccess;
use Tests\Support\BuildsPlacementScenario;
use Tests\TestCase;

final class PlacementDeskTest extends TestCase
{
    use AcademicAccess, BuildsPlacementScenario, RefreshDatabase;

    public function test_registrar_uploads_a_file_reviews_an_exact_placement_and_approves_it(): void
    {
        $this->get(route('admin.placements.index'))->assertRedirect(route('login'));
        $this->academicUser('super_admin');
        $this->get(route('admin.placements.template'))->assertForbidden();
        $this->get(route('admin.placements.references'))->assertForbidden();
        $registrar = $this->academicUser('registrar');
        $this->get(route('admin.placements.index'))->assertInertia(fn (AssertableInertia $page) => $page
            ->component('Admin/PlacementDesk')->has('updates', 0)->where('selected', null)->etc());

        $adoption = CurriculumAdoption::factory()->create();
        $decision = $adoption->activeDecision;
        $level = ProgrammeLevel::factory()->for($decision->academicPathway->programme, 'programme')->create();
        $student = Student::factory()->create();
        $row = [
            'REG-1', 1, $student->external_student_id, $adoption->academic_pathway_id,
            $adoption->academic_session_id, $adoption->entry_cohort_id, $level->id,
            $decision->academicSession->starts_on->toDateString(),
        ];
        $csv = $this->get(route('admin.placements.template'))->assertOk()->getContent();
        $this->assertSame("registration_id,update_number,student_id,pathway_id,session_id,cohort_id,programme_level_id,effective_on\r\n", $csv);
        $references = $this->get(route('admin.placements.references'))
            ->assertOk()
            ->assertDownload('placement-reference-ids.csv')
            ->assertHeader('Content-Type', 'text/csv; charset=UTF-8')
            ->streamedContent();
        $this->assertStringStartsWith("kind,id,name,programme_id\n", $references);
        $this->assertStringContainsString($adoption->academic_pathway_id, $references);
        $this->assertStringContainsString($level->id, $references);
        $valid = implode(',', $row)."\r\n";
        $row[7] = $decision->academicSession->starts_on->addDay()->toDateString();
        $conflict = implode(',', $row)."\r\n";
        $this->post(route('admin.placements.upload'), [
            'file' => UploadedFile::fake()->createWithContent('placements.csv', $csv.$valid.$conflict),
        ])->assertSessionHasErrors(['file' => 'Row 3: This update number already has different details.']);
        $this->assertDatabaseEmpty('placement_updates');
        $this->assertDatabaseEmpty('official_registrations');

        $this->post(route('admin.placements.upload'), [
            'file' => UploadedFile::fake()->createWithContent('placements.csv', $csv.$valid),
        ])->assertSessionHasNoErrors()->assertRedirect(route('admin.placements.index'));

        $update = PlacementUpdate::sole();
        $details = route('admin.placements.index', $update);
        $approve = route('admin.placements.approve', $update);
        $this->assertDatabaseEmpty('placement_acceptances');
        $this->get($details)->assertInertia(fn (AssertableInertia $page) => $page
            ->where('selected.registration', 'REG-1')
            ->where('selected.student', $student->external_student_id)
            ->where('selected.accepted', false)
            ->where('selected.requiresReason', false)
            ->where('actions.approve', route('admin.placements.approve', $update, false))->etc());
        $this->post($approve)->assertSessionHasNoErrors()->assertRedirect($details);
        $this->assertDatabaseHas('placement_acceptances', [
            'placement_update_id' => $update->id,
            'approved_by' => $registrar->id,
            'curriculum_adoption_decision_id' => $decision->id,
        ]);
        $this->get($details)->assertInertia(fn (AssertableInertia $page) => $page
            ->where('selected.accepted', true)->where('selected.curriculumVersion', $decision->curriculum->version)->etc());
    }

    public function test_placement_navigation_and_success_keep_the_validated_list_page(): void
    {
        $registrar = $this->academicUser('registrar');
        $student = Student::factory()->create();
        $pin = CurriculumAdoption::factory()->create()->activeDecision;
        $update = app(OfficialPlacementRegister::class)->queue($registrar, $this->placementRow($student, $pin));
        $detail = route('admin.placements.index', $update, false);
        $approval = route('admin.placements.approve', $update, false);
        $link = route('admin.placements.link', $update, false);
        $list = route('admin.placements.index', absolute: false);
        $upload = route('admin.placements.upload', absolute: false);

        $this->get($detail.'?page=2&unknown=value')->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->where('listUrl', $list.'?page=2')
                ->where('selected.url', $detail.'?page=2')
                ->where('actions.approve', $approval.'?page=2')
                ->where('actions.link', $link.'?page=2')
                ->where('actions.upload', $upload.'?page=2')
                ->etc());
        $this->get($detail.'?page=-42')->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->where('listUrl', $list)
                ->where('actions.approve', $approval)
                ->etc());

        $this->post($approval.'?page=2&unknown=value')->assertSessionHasNoErrors()->assertRedirect($detail.'?page=2');
        $this->assertDatabaseHas('placement_acceptances', ['placement_update_id' => $update->id]);
    }
}
