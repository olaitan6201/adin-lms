<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Inertia\Testing\AssertableInertia;
use Tests\TestCase;

class CourseAccessTest extends TestCase
{
    use RefreshDatabase;

    public function test_course_access_tracks_registration_even_in_an_existing_session(): void
    {
        $this->withoutVite();
        $this->get('/courses')->assertRedirect(route('login'));
        $user = User::factory()->create();
        $student = DB::table('students')->insertGetId(['external_student_id' => 'S1', 'user_id' => $user->id]);
        $course = DB::table('offerings')->insertGetId(['external_offering_id' => 'C1']);
        $other = DB::table('offerings')->insertGetId(['external_offering_id' => 'C2']);
        $enrolment = DB::table('enrolments')->insertGetId([
            'student_id' => $student, 'offering_id' => $course, 'status' => 'registered', 'source_revision' => 1,
        ]);

        $this->post('/login', ['email' => $user->email, 'password' => 'wrong'])->assertSessionHasErrors('email');
        $this->assertGuest();
        $this->post('/login', ['email' => $user->email, 'password' => 'password'])->assertRedirect(route('courses.index'));
        $this->get('/courses')->assertInertia(fn (AssertableInertia $page) => $page
            ->component('Courses')->has('courses', 1)->where('courses.0.id', $course));
        $this->get("/courses/{$course}")->assertOk();
        $this->get("/courses/{$other}")->assertNotFound();

        DB::table('enrolments')->where('id', $enrolment)->update(['status' => 'withdrawn', 'source_revision' => 2]);
        $this->get("/courses/{$course}")->assertNotFound();
        $this->get('/courses')->assertInertia(fn (AssertableInertia $page) => $page->has('courses', 0));
        $this->post('/logout')->assertRedirect(route('home'));
        $this->assertGuest();
    }
}
