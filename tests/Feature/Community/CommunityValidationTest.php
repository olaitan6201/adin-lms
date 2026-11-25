<?php

namespace Tests\Feature\Community;

use App\Models\Forum;
use App\Models\Notification;
use App\Models\Offering;
use App\Models\StudyGroup;

final class CommunityValidationTest extends CommunityTestCase
{
    public function test_group_must_belong_to_the_course_being_configured(): void
    {
        $otherCourse = Offering::factory()->create();
        $foreignGroup = StudyGroup::forceCreate([
            'name' => 'Other cohort',
            'offering_id' => $otherCourse->id,
        ]);

        $this->actingAs($this->person('lecturer'))
            ->post(route('community.forums.create', $this->course()), [
                'title' => 'Discussion',
                'group_id' => $foreignGroup->id,
            ])
            ->assertSessionHasErrors('group_id');

        $this->assertDatabaseEmpty('forums');
    }

    public function test_malformed_learner_inputs_leave_messages_posts_and_read_state_unchanged(): void
    {
        $learner = $this->person('ada');
        $course = $this->course();
        $forum = Forum::forceCreate(['title' => 'Test forum', 'offering_id' => $course->id]);
        $notice = Notification::forceCreate([
            'recipient_id' => $learner->id,
            'body' => 'Notice',
            'event_key' => 'test-notice',
            'created_at' => now(),
        ]);

        $this->actingAs($learner)
            ->post(route('community.message', $course), ['recipient_id' => 'invalid', 'body' => ['bad type']])
            ->assertSessionHasErrors(['recipient_id', 'body']);
        $this->post(route('community.post', $forum), [
            'body' => 'Reply',
            'parent_id' => 'invalid',
        ])->assertSessionHasErrors('parent_id');
        $this->patch(route('community.notifications.read', $notice), [
            'read' => 'sometimes',
        ])->assertSessionHasErrors('read');

        $this->assertDatabaseEmpty('private_messages');
        $this->assertDatabaseEmpty('posts');
        $this->assertNull($notice->fresh()->read_at);
    }
}
