<?php

namespace Tests\Feature\Learning;

use App\Models\CourseOutcome;
use App\Models\Forum;
use App\Models\Module;
use App\Models\StudyGroup;
use Inertia\Testing\AssertableInertia as Page;

class CourseOutlineTest extends LearningTestCase
{
    public function test_outline_combines_released_course_work_and_personal_completion(): void
    {
        $url = route('courses.show', $this->offering);
        $lesson = Module::where('offering_id', $this->offering->id)->sole();
        $class = $this->schedule('Seminar');
        CourseOutcome::forceCreate(['curriculum_course_id' => $this->offering->curriculum_course_id, 'statement' => 'Explain an algorithm']);
        Forum::forceCreate(['offering_id' => $this->offering->id, 'title' => 'Reading questions']);
        $group = StudyGroup::forceCreate(['offering_id' => $this->offering->id, 'name' => 'Group B']);
        Forum::forceCreate(['offering_id' => $this->offering->id, 'group_id' => $group->id, 'title' => 'Private tutorial']);
        Module::factory()->create(['offering_id' => $this->offering->id, 'kind' => 'draft:weekly', 'position' => 2]);

        $this->actingAs($this->learner)->get($url)->assertInertia(fn (Page $p) => $p
            ->where('course.title', 'Introduction to Computing')->where('lecturers.0', 'Demo Lecturer')
            ->where('outcomes.0', 'Explain an algorithm')->has('activities', 3)
            ->where('activities.0.id', $lesson->id)->where('activities.0.complete', false)
            ->where('activities.1.id', $class->id)->where('activities.2.title', 'Reading questions'));
        $this->post($this->base.'/lessons/'.$lesson->id.'/complete')->assertRedirect();
        $this->get($url)->assertInertia(fn (Page $p) => $p->where('activities.0.complete', true));
        $this->withdraw();
        $this->get($url)->assertNotFound();
    }
}
