<?php

namespace Tests\Feature;

use App\Enums\CurriculumStatus;
use App\Enums\PathwayCurriculumAuditAction;
use App\Models\AcademicPathway;
use App\Models\CourseRevision;
use App\Models\Curriculum;
use App\Models\ProgrammeLevel;
use Brick\Math\BigDecimal;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Tests\Support\AcademicAccess;
use Tests\Support\PathwayCurriculumScenario;
use Tests\TestCase;

class AdminPathwayCurriculumTest extends TestCase
{
    use AcademicAccess, PathwayCurriculumScenario, RefreshDatabase;

    public function test_versions_are_numbered_per_pathway_without_legacy_placeholders(): void
    {
        $actor = $this->academicUser();
        $pathway = AcademicPathway::factory()->create();
        $this->post(route('admin.academic-core.curricula.store'), [
            'academic_pathway_id' => $pathway->id,
            'framework_revision' => 'Framework 2027',
            'programme_id' => Str::uuid7()->toString(),
            'status' => 'approved',
        ])->assertRedirect(route('admin.academic-core', [
            'curriculum' => Curriculum::where('academic_pathway_id', $pathway->id)->sole()->id,
        ]));

        $first = Curriculum::where('academic_pathway_id', $pathway->id)->sole();
        $second = $this->createVersion($pathway);
        $other = $this->createVersion();

        $this->assertSame(1, $first->version);
        $this->assertSame(2, $second->version);
        $this->assertSame(1, $other->version);
        $this->assertNull($first->programme_id);
        $this->assertSame($pathway->academic_programme_id, $first->academic_programme_id);
        $this->assertSame(CurriculumStatus::Draft, $first->status);
        $this->assertDatabaseHas('audit_logs', [
            'actor_id' => $actor->id,
            'action' => PathwayCurriculumAuditAction::Created->value,
            'subject_key' => 'curricula:'.$first->id,
        ]);
    }

    public function test_only_an_approved_department_revision_and_a_pathway_level_can_be_assigned(): void
    {
        $this->academicUser();
        $version = $this->createVersion();
        $approved = $this->revisionFor($version);
        $draft = CourseRevision::factory()->for($approved->course)->create(['revision_number' => 2]);
        $outside = CourseRevision::factory()->approved()->create();
        $wrongLevel = ProgrammeLevel::factory()->create();

        foreach ([$draft, $outside] as $revision) {
            $this->postCurriculum($version, 'assignment', $this->assignmentData($version, ['course_revision_id' => $revision->id]))
                ->assertSessionHasErrors('course_revision_id');
        }

        $data = $this->assignmentData($version, ['course_revision_id' => $approved->id]);
        $this->postCurriculum($version, 'assignment', ['programme_level_id' => $wrongLevel->id] + $data)
            ->assertSessionHasErrors('programme_level_id');
        $this->postCurriculum($version, 'assignment', ['credits' => '3.123456789'] + $data)
            ->assertSessionHasErrors('credits');
        $this->postJson(route('admin.academic-core.curricula.assignment', $version), ['credits' => 3.12345678] + $data)
            ->assertUnprocessable()->assertJsonValidationErrors('credits');
        $this->postCurriculum($version, 'assignment', ['category' => 'compulsory'] + $data)
            ->assertSessionHasErrors('category');
        $this->assertDatabaseCount('curriculum_courses', 0);

        $entry = $this->assign($version, ['category' => 'general_studies'] + $data);
        $this->assertSame($approved->id, $entry->course_revision_id);
        $this->assertSame($approved->course_id, $entry->course_id);
        $this->assertSame($data['programme_level_id'], $entry->programme_level_id);
        $this->assertTrue(BigDecimal::of((string) $entry->getRawOriginal('credits'))->isEqualTo('3.12345678'));
        $this->assertSame('general_studies', $entry->getRawOriginal('category'));
        $this->assertNull($entry->level_id);
        $this->assertNull($entry->title);
        $this->assertNull($entry->compulsory);

        $anotherApprovedRevision = CourseRevision::factory()->approved()->for($approved->course)->create(['revision_number' => 3]);
        $this->postCurriculum($version, 'assignment', ['course_revision_id' => $anotherApprovedRevision->id] + $data)
            ->assertSessionHasErrors('course_revision_id');
        $this->assertDatabaseCount('curriculum_courses', 1);
    }

    public function test_lifecycle_enforces_institutional_edit_and_approve_and_persists_actor(): void
    {
        $editor = $this->academicUser();
        $version = $this->createVersion();
        $this->postCurriculum($version, 'review')->assertSessionHasErrors('status');
        $this->postCurriculum($version, 'approve')->assertForbidden();
        $this->assertSame(CurriculumStatus::Draft, $version->refresh()->status);

        $this->assign($version);
        $this->postCurriculum($version, 'review')->assertSessionHasNoErrors();
        $this->assertSame(CurriculumStatus::Reviewed, $version->refresh()->status);
        $this->postCurriculum($version, 'assignment', $this->assignmentData($version))->assertSessionHasErrors('status');
        $this->assertNull($version->approved_by);

        $approver = $this->academicUser('super_admin');
        $this->postCurriculum($version, 'approve', ['approved_by' => $editor->id])->assertSessionHasNoErrors();
        $this->assertSame(CurriculumStatus::Approved, $version->refresh()->status);
        $this->assertSame($approver->id, $version->approved_by);
        $this->assertNotNull($version->approved_at);
        $this->postCurriculum($version, 'approve')->assertSessionHasErrors('status');
        $this->assertDatabaseHas('audit_logs', [
            'actor_id' => $approver->id,
            'action' => PathwayCurriculumAuditAction::Approved->value,
            'subject_key' => 'curricula:'.$version->id,
        ]);
        $this->assertDatabaseCount('curriculum_courses', 1);

        $this->academicUser('quality_assurance_officer');
        $this->postCurriculum($version, 'fork')->assertForbidden();
        $this->assertDatabaseCount('curricula', 1);
    }

    public function test_legacy_and_pathway_mutations_are_fenced_in_both_directions(): void
    {
        $this->academicUser('super_admin');
        $legacy = Curriculum::factory()->create();
        $pathway = $this->createVersion();

        $this->postCurriculum($legacy, 'review')->assertSessionHasErrors('status');
        $this->postCurriculum($legacy, 'fork')->assertSessionHasErrors('status');
        $this->post("/academics/curriculum/{$pathway->id}/review")->assertSessionHasErrors('status');
        $this->assertSame(CurriculumStatus::Draft, $legacy->refresh()->status);
        $this->assertSame(CurriculumStatus::Draft, $pathway->refresh()->status);
    }
}
