<?php

namespace Tests\Feature;

use App\Models\CurriculumCourse;
use App\Models\Enrolment;
use App\Models\Offering;
use App\Models\Semester;
use App\Models\Student;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia;
use Tests\TestCase;

class CourseSearchTest extends TestCase
{
    use RefreshDatabase;

    public function test_search_returns_only_published_current_registrations_and_treats_wildcards_literally(): void
    {
        $this->withoutVite();
        $this->get('/search?q=math')->assertRedirect(route('login'));
        $user = User::factory()->create();
        $student = Student::factory()->create(['user_id' => $user->id]);
        $published = [
            'status' => 'published', 'section' => 'A', 'delivery_mode' => 'blended',
            'approved_by' => $user->id, 'approved_at' => now(), 'semester_id' => Semester::factory(),
            'curriculum_course_id' => CurriculumCourse::factory()->state(['title' => 'Maths and Logic']),
        ];
        $visible = Offering::factory()->create($published);
        $draft = Offering::factory()->create(['external_offering_id' => 'MATH-DRAFT']);
        $foreign = Offering::factory()->create($published);
        $withdrawn = Offering::factory()->create($published);
        foreach ([$visible, $draft] as $offering) {
            Enrolment::factory()->create(['offering_id' => $offering->id, 'student_id' => $student->id]);
        }

        Enrolment::factory()->create(['offering_id' => $foreign->id]);
        Enrolment::factory()->create(['offering_id' => $withdrawn->id, 'student_id' => $student->id, 'status' => 'withdrawn']);

        $this->actingAs($user)->get('/search?q=mAtH')->assertInertia(fn (AssertableInertia $page) => $page
            ->component('CourseSearch')->has('matches', 1)->where('matches.0.id', $visible->id)
            ->where('matches.0.title', 'Maths and Logic')->missing('matches.0.student_id'));
        foreach (['', '%', '_'] as $term) {
            $this->get('/search?q='.urlencode($term))->assertInertia(fn (AssertableInertia $page) => $page->has('matches', 0));
        }

        $this->get('/search?q='.str_repeat('x', 81))->assertSessionHasErrors('q');
    }
}
