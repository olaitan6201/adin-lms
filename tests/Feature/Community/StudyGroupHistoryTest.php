<?php

namespace Tests\Feature\Community;

use App\Enums\StudyGroupAuditAction;
use App\Models\AuditLog;
use App\Models\CurriculumCourse;
use App\Models\Enrolment;
use App\Models\Offering;
use App\Models\StudyGroup;
use Inertia\Testing\AssertableInertia as Page;

class StudyGroupHistoryTest extends CommunityTestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        $this->actingAs($this->person('lecturer'));
    }

    public function test_effective_saves_record_before_and_after_membership_snapshots(): void
    {
        $course = $this->course();
        $teacher = $this->person('lecturer');
        $ada = $this->person('ada');
        $adaName = $ada->student->user->full_name;
        $adaEnrolment = $ada->student->enrolments()->where('offering_id', $course->id)->sole();
        $grace = $this->enrolment($course, 'Grace Hopper');

        $this->post(route('community.groups.create', $course), [
            'name' => 'Red',
            'members' => [$adaEnrolment->id, $grace->id],
        ])->assertSessionHasNoErrors()->assertRedirect();

        $team = StudyGroup::where('name', 'Red')->sole();
        $created = AuditLog::where('action', StudyGroupAuditAction::Saved->value)->sole();
        $expectedAdded = collect([
            ['enrolment_id' => $adaEnrolment->id, 'label' => $adaName],
            ['enrolment_id' => $grace->id, 'label' => 'Grace Hopper'],
        ])->sortBy('enrolment_id')->values()->all();

        $this->assertSame($teacher->id, $created->actor_id);
        $this->assertSame('study-group:'.$team->id, $created->subject_key);
        $this->assertSame($course->id, $created->details['offering_id']);
        $this->assertSame($team->id, $created->details['group_id']);
        $this->assertNull($created->details['name_before']);
        $this->assertSame('Red', $created->details['name_after']);
        $this->assertEquals($expectedAdded, $created->details['added']);
        $this->assertSame([], $created->details['removed']);

        $this->post(route('community.groups.update', [$course, $team]), [
            'name' => 'Blue',
            'members' => [$grace->id],
        ])->assertSessionHasNoErrors()->assertRedirect();

        $updated = AuditLog::where('action', StudyGroupAuditAction::Saved->value)
            ->latest('occurred_at')->latest('id')->firstOrFail();
        $ada->student->user->update(['full_name' => 'Changed profile name']);

        $this->assertSame('Red', $updated->details['name_before']);
        $this->assertSame('Blue', $updated->details['name_after']);
        $this->assertSame([], $updated->details['added']);
        $this->assertEquals([
            ['enrolment_id' => $adaEnrolment->id, 'label' => $adaName],
        ], $updated->details['removed']);
        $this->get(route('community.board', $course))->assertInertia(fn (Page $page) => $page
            ->has('groups', 1)
            ->has('groups.0.history', 2)
            ->where('groups.0.history.0.details.name_after', 'Blue')
            ->where('groups.0.history.0.details.removed.0.label', $adaName)
            ->where('groups.0.history.1.details.name_before', null));

        $this->post(route('community.groups.update', [$course, $team]), [
            'name' => 'Blue',
            'members' => [$grace->id],
        ])->assertSessionHasNoErrors()->assertRedirect();

        $this->assertSame(2, AuditLog::where('action', StudyGroupAuditAction::Saved->value)->count());
    }

    public function test_history_is_teacher_only_and_scoped_to_the_current_offering(): void
    {
        $course = $this->course();
        $member = $this->enrolment($course, 'Current learner');
        $otherCourse = Offering::factory()->create(['curriculum_course_id' => CurriculumCourse::factory()]);
        $foreign = StudyGroup::forceCreate(['offering_id' => $otherCourse->id, 'name' => 'Other course']);
        AuditLog::forceCreate([
            'actor_id' => $this->person('lecturer')->id,
            'action' => StudyGroupAuditAction::Saved->value,
            'subject_key' => 'study-group:'.$foreign->id,
            'occurred_at' => now(),
            'details' => ['offering_id' => $otherCourse->id],
        ]);
        $this->post(route('community.groups.create', $course), [
            'name' => 'Current course',
            'members' => [$member->id],
        ])->assertSessionHasNoErrors()->assertRedirect();
        $team = StudyGroup::where('offering_id', $course->id)->sole();

        $this->get(route('community.board', $course))->assertInertia(fn (Page $page) => $page
            ->where('canManage', true)
            ->has('groups', 1)
            ->where('groups.0.id', $team->id)
            ->has('groups.0.history', 1)
            ->where('groups.0.history.0.details.offering_id', $course->id));

        $this->actingAs($this->person('ada'))->get(route('community.board', $course))
            ->assertInertia(fn (Page $page) => $page
                ->where('canManage', false)
                ->where('groups', []));
    }

    public function test_invalid_and_unauthorized_saves_do_not_create_history(): void
    {
        $course = $this->course();
        $otherCourse = Offering::factory()->create(['curriculum_course_id' => CurriculumCourse::factory()]);
        $withdrawn = Enrolment::factory()->withdrawn()->create(['offering_id' => $course->id]);
        $foreign = $this->enrolment($otherCourse, 'Foreign learner');
        $create = route('community.groups.create', $course);

        $this->post($create, ['name' => 'Withdrawn', 'members' => [$withdrawn->id]])
            ->assertSessionHasErrors('members');
        $this->post($create, ['name' => 'Foreign', 'members' => [$foreign->id]])
            ->assertSessionHasErrors('members');
        $this->actingAs($this->person('ada'))->post($create, ['name' => 'Student'])
            ->assertForbidden();

        $this->assertSame(0, AuditLog::where('action', StudyGroupAuditAction::Saved->value)->count());
        $this->assertDatabaseCount('study_groups', 0);

        $this->actingAs($this->person('lecturer'))->post($create, ['name' => 'Empty', 'members' => []])
            ->assertSessionHasNoErrors()->assertRedirect();
        $team = StudyGroup::where('name', 'Empty')->sole();
        $foreignTeam = StudyGroup::forceCreate(['offering_id' => $otherCourse->id, 'name' => 'Foreign team']);

        $this->post(route('community.groups.update', [$course, $foreignTeam]), ['name' => 'Stolen'])
            ->assertNotFound();

        $this->assertSame(1, AuditLog::where('action', StudyGroupAuditAction::Saved->value)->count());
        $this->assertSame([], $team->members->pluck('enrolment_id')->all());
    }

    private function enrolment(Offering $course, string $name): Enrolment
    {
        $enrolment = Enrolment::factory()->create(['offering_id' => $course->id]);
        $enrolment->student->user->update(['full_name' => $name]);

        return $enrolment;
    }
}
