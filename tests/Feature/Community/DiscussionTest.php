<?php

namespace Tests\Feature\Community;

use App\Models\AuditLog;
use App\Models\Forum;
use App\Models\GroupMember;
use App\Models\Post;
use App\Models\StudyGroup;
use App\Models\User;
use Database\Seeders\AuthoritySeeder;
use Database\Seeders\DemoStaffAuthoritySeeder;
use Inertia\Testing\AssertableInertia as Page;

class DiscussionTest extends CommunityTestCase
{
    public function test_membership_threads_and_moderation_are_scoped_to_the_forum(): void
    {
        $course = $this->course();
        $ada = $this->person('ada');
        $general = Forum::forceCreate(['title' => 'Course discussion', 'offering_id' => $course->id]);
        $group = StudyGroup::forceCreate(['offering_id' => $course->id, 'name' => 'Team']);
        GroupMember::forceCreate([
            'group_id' => $group->id,
            'enrolment_id' => $ada->student->enrolments()->where('offering_id', $course->id)->sole()->id,
        ]);
        $this->actingAs($this->person('lecturer'))
            ->post(route('community.forums.create', $course), [
                'title' => 'Team forum',
                'group_id' => $group->id,
            ])
            ->assertRedirect();
        $team = Forum::where('group_id', $group->id)->sole();
        $action = route('community.post', $team);
        $this->actingAs($ada)
            ->post($action, ['body' => 'Only for the team'])
            ->assertRedirect();
        $post = Post::sole();
        $this->post($action, ['body' => 'First reply', 'parent_id' => $post->id])->assertRedirect();
        $this->post(route('community.post', $general), [
            'body' => 'Wrong thread',
            'parent_id' => $post->id,
        ])->assertSessionHasErrors('parent_id');
        $this->actingAs($this->person('tunde'))->get(route('community.discussion', $team))->assertForbidden();
        $this->post($action, ['body' => 'No access'])->assertForbidden();
        $hide = route('community.hide', [$team, $post]);
        $this->actingAs($ada)->patch($hide)->assertForbidden();
        $this->actingAs($this->person('lecturer'))->patch($hide)->assertRedirect();
        $this->patch($hide)->assertRedirect();
        $this->assertSame(
            1,
            AuditLog::where('action', 'community.post.hidden')
                ->where('actor_id', $this->person('lecturer')->id)
                ->where('subject_key', 'post:'.$post->id)
                ->count(),
        );
        $this->actingAs($ada)
            ->get(route('community.discussion', $team))
            ->assertInertia(fn (Page $p) => $p->has('posts', 1)->where('posts.0.body', 'First reply'));
        $ada->student
            ->enrolments()
            ->where('offering_id', $course->id)
            ->update(['status' => 'withdrawn']);
        $this->get(route('community.discussion', $team))->assertForbidden();
    }

    public function test_private_messages_and_announcements_reach_only_the_permitted_audience(): void
    {
        $course = $this->course();
        $ada = $this->person('ada');
        $teacher = $this->person('lecturer');
        $other = User::factory()->create();
        $action = route('community.message', $course);
        $this->actingAs($ada)
            ->post($action, ['recipient_id' => $other->id, 'body' => 'Not a peer'])
            ->assertForbidden();
        $this->actingAs($other)
            ->post($action, ['recipient_id' => $ada->id, 'body' => 'Not enrolled'])
            ->assertForbidden();
        $this->actingAs($teacher)
            ->post($action, ['recipient_id' => $ada->id, 'body' => 'Meet after class'])
            ->assertRedirect();
        $this->post(route('community.course.announce', $course), ['body' => 'Bring notes'])->assertRedirect();
        $this->actingAs($ada)
            ->post(route('community.course.announce', $course), ['body' => 'Forbidden'])
            ->assertForbidden();
        $this->get(route('community.board', $course))->assertInertia(
            fn (Page $p) => $p->where('announcements.0.body', 'Bring notes'),
        );
        $this->get(route('community.inbox'))->assertInertia(
            fn (Page $p) => $p->where('messages.0.body', 'Meet after class')->has('announcements', 0),
        );
        $this->actingAs($other)->get(route('community.board', $course))->assertForbidden();
        $this->get(route('community.inbox'))->assertInertia(fn (Page $p) => $p->has('messages', 0));
        $this->post(route('community.institution.announce'), ['body' => 'Forbidden'])->assertForbidden();
        $this->seed([AuthoritySeeder::class, DemoStaffAuthoritySeeder::class]);
        $admin = $this->person('officer');
        $this->actingAs($admin)
            ->withSession(['security.mfa_user' => $admin->id])
            ->post(route('community.institution.announce'), ['body' => 'Library hours'])
            ->assertRedirect();
        $this->actingAs($other)
            ->get(route('community.inbox'))
            ->assertInertia(fn (Page $p) => $p->where('announcements.0.body', 'Library hours'));
    }
}
