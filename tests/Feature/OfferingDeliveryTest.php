<?php

namespace Tests\Feature;

use App\Models\CurriculumCourse;
use App\Models\Enrolment;
use App\Models\LearningMaterial;
use App\Models\Lecturer;
use App\Models\Module;
use App\Models\Offering;
use App\Models\Semester;
use App\Models\Student;
use App\Models\TeachingAllocation;
use App\Models\User;
use Database\Seeders\DemoCampusSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia;
use Tests\Support\AcademicAccess;
use Tests\TestCase;

class OfferingDeliveryTest extends TestCase
{
    use AcademicAccess, RefreshDatabase;

    public function test_sections_recheck_entitlement_and_publish_state_on_every_request(): void
    {
        $manager = $this->academicUser(['offerings.manage']);
        $student = User::factory()->create();
        $profile = Student::factory()->create(['user_id' => $student->id]);
        $course = Offering::factory()->create();
        $entry = CurriculumCourse::factory()->create();
        $term = Semester::factory()->create();
        $sibling = Offering::factory()->create(['curriculum_course_id' => $entry->id, 'semester_id' => $term->id, 'section' => 'B']);
        $registration = Enrolment::factory()->create(['student_id' => $profile->id, 'offering_id' => $course->id]);
        Module::factory()->create(['offering_id' => $course->id]);
        Module::factory()->create(['offering_id' => $course->id, 'kind' => 'draft:lesson', 'position' => 2]);
        Module::factory()->create(['offering_id' => $course->id, 'position' => 3, 'opens_at' => now()->addWeek()]);
        $url = "/courses/$course->id";
        $path = "/academics/delivery/$course->id";
        $this->actingAs($student)->get($url)->assertInertia(fn (AssertableInertia $p) => $p->where('course.status', 'draft')->has('modules', 0));
        $this->get("/courses/$sibling->id")->assertNotFound();
        $this->post("$path/publish")->assertForbidden();
        $this->actingAs($manager->fresh())->withSession(['security.mfa_user' => $manager->id]);
        $this->post("$path/publish")->assertSessionHasErrors('status');
        $data = ['curriculum_course_id' => $entry->id, 'semester_id' => $term->id, 'section' => 'A'];
        $this->post("$path/prepare", $data + ['delivery_mode' => 'online'])->assertSessionHasErrors('curriculum_course_id');
        $entry->curriculum->forceFill(['status' => 'approved', 'approved_by' => $manager->id, 'approved_at' => now()])->save();
        foreach (['online', 'blended', 'face-to-face'] as $mode) {
            $this->post("$path/prepare", $data + ['delivery_mode' => $mode])->assertSessionHasNoErrors();
            $this->assertSame($mode, $course->refresh()->delivery_mode);
        }
        $this->post("$path/publish")->assertSessionHasErrors('status');
        $teacher = $this->academicUser([], 'lecturer', 'offering:'.$course->id);
        $lecturer = Lecturer::factory()->create(['user_id' => $teacher->id]);
        TeachingAllocation::factory()->create(['offering_id' => $course->id, 'lecturer_id' => $lecturer->id]);
        foreach (['publish' => 'published', 'unpublish' => 'unpublished', 'archive' => 'archived'] as $action => $state) {
            $this->actingAs($manager->fresh())->withSession(['security.mfa_user' => $manager->id])->post("$path/$action")->assertSessionHasNoErrors();
            $this->actingAs($student)->get($url)->assertInertia(fn (AssertableInertia $p) => $p->where('course.status', $state)->has('modules', $state === 'published' ? 1 : 0));
            $this->actingAs($teacher->fresh())->withSession(['security.mfa_user' => $teacher->id])->get($url)->assertInertia(fn (AssertableInertia $p) => $p->where('teaching', true)->where('course.status', $state)->has('modules', 3));
            $this->get("/courses/$sibling->id")->assertNotFound();
        }
        $registration->forceFill(['status' => 'withdrawn'])->save();
        $this->actingAs($student)->get($url)->assertNotFound();
    }

    public function test_copy_uses_fresh_activity_records_and_no_registrations(): void
    {
        $this->seed(DemoCampusSeeder::class);
        $this->academicUser(['offerings.manage']);
        $from = Offering::where('external_offering_id', 'DEMO-CSC101-2026-1')->sole();
        $into = Offering::where('external_offering_id', 'DEMO-CSC101-2026-2')->sole();
        $path = "/academics/delivery/$into->id/copy";
        $this->post($path, ['source_id' => $from->id])->assertSessionHasNoErrors();
        $this->assertSame($from->id, $into->refresh()->copied_from);
        $original = Module::where('offering_id', $from->id)->sole();
        $copy = Module::where('offering_id', $into->id)->sole();
        $this->assertSame($original->body, $copy->body);
        $copy->forceFill(['body' => 'Changed in new term'])->save();
        $this->assertNotSame($original->fresh()->body, $copy->body);
        $material = LearningMaterial::where('module_id', $copy->id)->sole();
        $this->assertDatabaseHas('material_versions', ['material_id' => $material->id, 'revision' => 1]);
        $this->assertGreaterThan(0, $from->enrolments()->count());
        $this->assertSame(0, $into->enrolments()->count());
        $this->post($path, ['source_id' => $from->id])->assertSessionHasErrors('source_id');
    }
}
