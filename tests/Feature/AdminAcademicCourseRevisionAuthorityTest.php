<?php

namespace Tests\Feature;

use App\Enums\CurriculumStatus;
use App\Models\Course;
use App\Models\CourseRevision;
use App\Services\Academics\CourseRevisionWorkflow;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Tests\Support\AcademicAccess;
use Tests\TestCase;

class AdminAcademicCourseRevisionAuthorityTest extends TestCase
{
    use AcademicAccess, RefreshDatabase;

    public function test_read_only_staff_cannot_mutate_the_catalogue(): void
    {
        $this->academicUser('quality_assurance_officer');
        $revision = CourseRevision::factory()->create();
        $course = $revision->course;

        $this->post(route('admin.academic-core.courses.store'))->assertForbidden();
        $this->post(route('admin.academic-core.revisions.store', $course))->assertForbidden();
        $this->patch(route('admin.academic-core.revisions.update', $revision))->assertForbidden();
        $this->post(route('admin.academic-core.revisions.review', $revision))->assertForbidden();
        $this->post(route('admin.academic-core.revisions.approve', $revision))->assertForbidden();

        $this->assertDatabaseCount('courses', 1);
        $this->assertDatabaseCount('course_revisions', 1);
        $this->assertSame(CurriculumStatus::Draft, $revision->refresh()->status);
        $this->assertDatabaseMissing('audit_logs', ['subject_key' => "course_revisions:$revision->id"]);
    }

    public function test_workflow_requires_approval_permission_even_without_the_http_gate(): void
    {
        $actor = $this->academicUser();
        $revision = CourseRevision::factory()->reviewed()->create();

        try {
            app(CourseRevisionWorkflow::class)->approve($actor, $revision);
            $this->fail('Workflow accepted an actor without approval permission.');
        } catch (AuthorizationException) {
            $this->assertSame(CurriculumStatus::Reviewed, $revision->refresh()->status);
            $this->assertNull($revision->approved_by);
            $this->assertDatabaseMissing('audit_logs', ['subject_key' => "course_revisions:$revision->id"]);
        }
    }

    public function test_approval_cannot_skip_review(): void
    {
        $this->academicUser('super_admin');
        $revision = CourseRevision::factory()->create();

        $this->post(route('admin.academic-core.revisions.approve', $revision))->assertSessionHasErrors('status');

        $this->assertSame(CurriculumStatus::Draft, $revision->refresh()->status);
        $this->assertNull($revision->approved_by);
        $this->assertDatabaseMissing('audit_logs', ['subject_key' => "course_revisions:$revision->id"]);
    }

    public function test_catalogue_routes_require_authentication(): void
    {
        $course = Course::factory()->create();
        $revision = CourseRevision::factory()->for($course)->create();

        $this->post(route('admin.academic-core.courses.store'))->assertRedirectToRoute('login');
        $this->post(route('admin.academic-core.revisions.store', $course))->assertRedirectToRoute('login');
        $this->patch(route('admin.academic-core.revisions.update', $revision))->assertRedirectToRoute('login');
        $this->post(route('admin.academic-core.revisions.review', $revision))->assertRedirectToRoute('login');
        $this->post(route('admin.academic-core.revisions.approve', $revision))->assertRedirectToRoute('login');

        $this->assertDatabaseCount('course_revisions', 1);
        $this->assertSame(CurriculumStatus::Draft, $revision->refresh()->status);
    }

    public function test_missing_and_invalid_course_inputs_produce_validation_errors(): void
    {
        $this->academicUser();

        $this->post(route('admin.academic-core.courses.store'), [
            'department_id' => (string) Str::uuid7(),
            'code' => "invalid\0code",
        ])->assertSessionHasErrors(['department_id', 'code']);

        $this->assertDatabaseCount('courses', 0);
    }

    public function test_incomplete_revision_cannot_begin_review_by_forging_state(): void
    {
        $this->academicUser();
        $course = Course::factory()->create();

        $this->post(route('admin.academic-core.revisions.store', $course), [
            'status' => 'reviewed',
            'syllabus' => ['invalid structure'],
            'learning_outcomes' => "invalid\0content",
        ])->assertSessionHasErrors(['title', 'description', 'standard_units', 'syllabus', 'learning_outcomes']);

        $this->assertDatabaseCount('course_revisions', 0);
        $this->assertDatabaseCount('curriculum_courses', 0);
    }
}
