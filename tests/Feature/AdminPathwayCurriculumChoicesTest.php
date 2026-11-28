<?php

namespace Tests\Feature;

use App\Enums\CurriculumStatus;
use App\Models\CurriculumChoiceGroup;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Support\AcademicAccess;
use Tests\Support\PathwayCurriculumScenario;
use Tests\TestCase;

class AdminPathwayCurriculumChoicesTest extends TestCase
{
    use AcademicAccess, PathwayCurriculumScenario, RefreshDatabase;

    public function test_groups_require_distinct_eligible_assignments_and_bounds_that_fit(): void
    {
        $this->academicUser();
        $version = $this->createVersion();
        $other = $this->createVersion();
        $coreChoice = $this->assign($version, ['requirement_mode' => 'choice']);
        $electiveChoice = $this->assign($version, ['requirement_mode' => 'choice', 'category' => 'elective']);
        $ordinary = $this->assign($version);
        $later = $this->assign($version, ['requirement_mode' => 'choice', 'semester_position' => 2]);
        $foreign = $this->assign($other, ['requirement_mode' => 'choice']);
        $data = [
            'code' => 'Pick One',
            'minimum_selections' => 1,
            'maximum_selections' => 1,
            'curriculum_course_ids' => [$coreChoice->id, $electiveChoice->id],
        ];

        foreach ([$ordinary, $foreign, $later] as $entry) {
            $this->postCurriculum($version, 'choice', ['curriculum_course_ids' => [$coreChoice->id, $entry->id]] + $data)
                ->assertSessionHasErrors('curriculum_course_ids');
        }
        $this->postCurriculum($version, 'choice', ['curriculum_course_ids' => [$coreChoice->id, strtoupper($coreChoice->id)]] + $data)
            ->assertSessionHasErrors('curriculum_course_ids.0');
        $this->postCurriculum($version, 'choice', ['maximum_selections' => 3] + $data)
            ->assertSessionHasErrors('maximum_selections');
        $this->postCurriculum($version, 'choice', ['minimum_selections' => 2] + $data)
            ->assertSessionHasErrors('minimum_selections');
        $this->assertDatabaseCount('curriculum_choice_groups', 0);
        $this->assertDatabaseCount('curriculum_choice_options', 0);

        $this->postCurriculum($version, 'choice', $data)->assertSessionHasNoErrors();
        $this->postCurriculum($version, 'choice', ['code' => 'Overlap'] + $data)
            ->assertSessionHasErrors('curriculum_course_ids');
        $group = CurriculumChoiceGroup::sole();
        $this->assertSame(1, $group->minimum_selections);
        $this->assertSame(1, $group->maximum_selections);
        $this->assertEqualsCanonicalizing([$coreChoice->id, $electiveChoice->id], $group->options()->pluck('curriculum_course_id')->all());
        $this->assertSame('core', $coreChoice->getRawOriginal('category'));
        $this->assertSame('elective', $electiveChoice->getRawOriginal('category'));
    }

    public function test_review_requires_every_choice_to_be_grouped_and_approval_rechecks_the_graph(): void
    {
        $this->academicUser('super_admin');
        $version = $this->createVersion();
        $choice = $this->assign($version, ['requirement_mode' => 'choice', 'credits' => '0.00000001']);
        $this->postCurriculum($version, 'review')->assertSessionHasErrors('status');
        $this->assertSame(CurriculumStatus::Draft, $version->refresh()->status);

        $option = $this->assign($version, ['requirement_mode' => 'choice']);
        $this->postCurriculum($version, 'choice', [
            'code' => 'Alternatives',
            'minimum_selections' => 1,
            'maximum_selections' => 1,
            'curriculum_course_ids' => [$choice->id, $option->id],
        ])->assertSessionHasNoErrors();
        $this->postCurriculum($version, 'review')->assertSessionHasNoErrors();

        $group = CurriculumChoiceGroup::sole();
        $group->update(['maximum_selections' => 3]);
        $this->postCurriculum($version, 'approve')->assertSessionHasErrors('status');
        $this->assertSame(CurriculumStatus::Reviewed, $version->refresh()->status);
        $this->assertNull($version->approved_by);
        $this->assertDatabaseMissing('audit_logs', ['action' => 'curriculum.pathway.approved']);

        $group->update(['maximum_selections' => 2]);
        $this->postCurriculum($version, 'approve')->assertSessionHasNoErrors();
        $this->assertSame(CurriculumStatus::Approved, $version->refresh()->status);
    }
}
