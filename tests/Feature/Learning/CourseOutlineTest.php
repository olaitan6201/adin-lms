<?php

namespace Tests\Feature\Learning;

use App\Models\AssessmentItem;
use App\Models\CourseOutcome;
use App\Models\Examination;
use App\Models\Forum;
use App\Models\Gradebook;
use App\Models\Module;
use App\Models\StudyGroup;
use Database\Seeders\DemoTeachingWeekSeeder;
use Inertia\Testing\AssertableInertia as Page;

class CourseOutlineTest extends LearningTestCase
{
    public function test_assessment_outline_links_to_deliveries_without_paper_or_answers(): void
    {
        $this->seed(DemoTeachingWeekSeeder::class);
        $item = AssessmentItem::forceCreate([
            'gradebook_id' => Gradebook::where('offering_id', $this->offering->id)->sole()->id,
            'kind' => 'exam', 'title' => 'Concept check', 'weight_percent' => 0, 'maximum_score' => 5,
        ]);
        Examination::forceCreate([
            'item_id' => $item->id, 'opens_at' => now()->addDay(), 'closes_at' => now()->addDays(2),
            'duration_seconds' => 600, 'max_attempts' => 1, 'shuffle_options' => true,
        ]);
        $this->actingAs($this->learner)->get(route('courses.show', $this->offering))->assertInertia(fn (Page $p) => $p
            ->has('activities', 5)->where('activities.3.type', 'Assignment')
            ->where('activities.3.href', fn ($href) => str_contains($href, '/assignments/'))
            ->where('activities.4.title', 'Concept check')->where('activities.4.type', 'Quiz')
            ->where('activities.4.detail', 'Upcoming · 0% of result')
            ->where('activities.4.href', route('assessment.desk', $this->offering).'#item-'.$item->id)
            ->missing('activities.4.questions')->missing('activities.4.scores'));
    }

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
        $endpoint = route('learning.sequence', $this->offering);
        $this->put($endpoint, ['activities' => [$class->id]])->assertForbidden();
        $this->actingAs($this->teacher)->put($endpoint, ['activities' => [$class->id]])->assertSessionHasErrors('activities');
        $order = [$class->id, ...Module::where('offering_id', $this->offering->id)->orderBy('position')->pluck('id'),
            ...Forum::where('offering_id', $this->offering->id)->pluck('id')];
        $this->put($endpoint, ['activities' => $order])->assertSessionHasNoErrors()->assertRedirect($url);
        $this->actingAs($this->learner)->get($url)->assertInertia(fn (Page $p) => $p
            ->has('activities', 3)->where('activities.0.title', 'Seminar')->where('activities.1.complete', true));
        $this->withdraw();
        $this->get($url)->assertNotFound();
    }
}
