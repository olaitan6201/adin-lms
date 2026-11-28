<?php

namespace Tests\Feature;

use App\Enums\CurriculumStatus;
use App\Models\AuditLog;
use App\Models\Course;
use App\Models\CourseRevision;
use App\Models\Department;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use PHPUnit\Framework\Attributes\TestWith;
use Tests\Support\AcademicAccess;
use Tests\TestCase;

class AdminAcademicCourseRevisionTest extends TestCase
{
    use AcademicAccess, RefreshDatabase;

    public function test_course_code_uniqueness_is_institution_wide_and_ownership_does_not_change(): void
    {
        $actor = $this->academicUser();
        [$owner, $other] = Department::factory()->count(2)->create();

        $response = $this->post(route('admin.academic-core.courses.store'), [
            'department_id' => $owner->id, 'code' => 'CSC 301', 'id' => $other->id,
        ])->assertSessionHasNoErrors();
        $course = Course::query()->sole();
        $response->assertRedirectToRoute('admin.academic-core', ['course' => $course->id]);
        $this->post(route('admin.academic-core.courses.store'), [
            'department_id' => $other->id, 'code' => 'CSC 301',
        ])->assertSessionHasErrors('code');

        $this->assertTrue(Str::isUuid($course->id, 7));
        $this->assertSame($owner->id, $course->department_id);
        $this->assertSame('CSC 301', $course->code);
        $this->assertDatabaseCount('course_revisions', 0);
        $this->assertDatabaseHas('audit_logs', [
            'subject_key' => "courses:$course->id", 'actor_id' => $actor->id, 'action' => 'course.created',
        ]);
    }

    public function test_course_definition_is_numbered_exactly_and_approval_freezes_it(): void
    {
        $editor = $this->academicUser();
        $course = Course::factory()->create();
        $unrelated = Course::factory()->create();

        $this->post(route('admin.academic-core.revisions.store', $course), $this->definition() + [
            'course_id' => $unrelated->id, 'department_id' => $unrelated->department_id, 'revision_number' => 22,
            'id' => $unrelated->id, 'status' => 'approved', 'approved_by' => $editor->id, 'approved_at' => now(),
        ])->assertRedirectToRoute('admin.academic-core', ['course' => $course->id])->assertSessionHasNoErrors();

        $first = CourseRevision::query()->sole();
        $this->assertTrue(Str::isUuid($first->id, 7));
        $this->assertNotSame($unrelated->id, $first->id);
        $this->assertSame($course->id, $first->course_id);
        $this->assertSame(1, $first->revision_number);
        $this->assertSame('3.12345678', $first->standard_units);
        $this->assertSame(CurriculumStatus::Draft, $first->status);
        $this->assertNull($first->approved_by);
        $this->assertNull($first->approved_at);

        $this->patch(route('admin.academic-core.revisions.update', $first), [
            'title' => 'Updated definition', 'syllabus' => 'Week one', 'learning_outcomes' => 'Explain the method',
            'status' => 'approved', 'course_id' => $unrelated->id,
        ] + $this->definition())->assertRedirectToRoute('admin.academic-core', ['course' => $course->id])->assertSessionHasNoErrors();
        $this->post(route('admin.academic-core.revisions.review', $first), [
            'status' => 'approved', 'approved_by' => $editor->id,
        ])->assertRedirectToRoute('admin.academic-core', ['course' => $course->id])->assertSessionHasNoErrors();
        $this->assertSame(CurriculumStatus::Reviewed, $first->refresh()->status);
        $this->assertNull($first->approved_by);
        $this->assertSame($course->id, $first->course_id);

        $this->patch(route('admin.academic-core.revisions.update', $first), $this->definition())
            ->assertSessionHasErrors('status');
        $this->post(route('admin.academic-core.revisions.approve', $first))->assertForbidden();
        $approver = $this->academicUser('super_admin');
        $this->freezeSecond();
        $this->post(route('admin.academic-core.revisions.approve', $first), [
            'status' => 'draft', 'title' => 'Unexpected content', 'approved_by' => $editor->id,
            'approved_at' => '2000-01-01',
        ])->assertRedirectToRoute('admin.academic-core', ['course' => $course->id])->assertSessionHasNoErrors();

        $this->patch(route('admin.academic-core.revisions.update', $first), $this->definition())->assertSessionHasErrors('status');
        $this->post(route('admin.academic-core.revisions.approve', $first))->assertSessionHasErrors('status');
        $this->post(route('admin.academic-core.revisions.store', $course), $this->definition())
            ->assertRedirectToRoute('admin.academic-core', ['course' => $course->id])->assertSessionHasNoErrors();

        $this->assertSame(2, CourseRevision::query()->where('status', 'draft')->sole()->revision_number);
        $this->assertSame(CurriculumStatus::Approved, $first->refresh()->status);
        $this->assertSame($approver->id, $first->approved_by);
        $this->assertSame(now()->getTimestamp(), $first->approved_at->getTimestamp());
        $this->assertSame('Updated definition', $first->title);
        $this->assertSame('Week one', $first->syllabus);
        $this->assertSame('Explain the method', $first->learning_outcomes);
        $this->assertSame([
            'course_revision.approved' => $approver->id,
            'course_revision.drafted' => $editor->id,
            'course_revision.reviewed' => $editor->id,
            'course_revision.updated' => $editor->id,
        ], AuditLog::where('subject_key', "course_revisions:$first->id")->orderBy('action')->pluck('actor_id', 'action')->all());
        $this->assertSame(4, AuditLog::where('subject_key', "course_revisions:$first->id")->count());
        $this->assertDatabaseCount('curriculum_courses', 0);
        $this->assertDatabaseCount('offerings', 0);
    }

    #[TestWith(['3.123456789'])]
    #[TestWith(['10000000000000000'])]
    #[TestWith(['1e2'])]
    #[TestWith(['-1'])]
    #[TestWith([1.5])]
    public function test_invalid_decimal_never_creates_a_revision(string|float $units): void
    {
        $this->academicUser();
        $course = Course::factory()->create();

        $this->postJson(route('admin.academic-core.revisions.store', $course), ['standard_units' => $units] + $this->definition())
            ->assertUnprocessable()->assertJsonValidationErrors('standard_units');

        $this->assertDatabaseCount('course_revisions', 0);
    }

    public function test_decimal_write_does_not_silently_lose_precision_on_the_configured_engine(): void
    {
        $this->academicUser();
        $course = Course::factory()->create();
        $units = '9999999999999999.99999999';

        $response = $this->post(route('admin.academic-core.revisions.store', $course), ['standard_units' => $units] + $this->definition());

        if (DB::getDriverName() === 'sqlite') {
            $response->assertSessionHasErrors('standard_units');
            $this->assertDatabaseCount('course_revisions', 0);

            return;
        }

        $response->assertRedirectToRoute('admin.academic-core', ['course' => $course->id])->assertSessionHasNoErrors();
        $this->assertSame($units, CourseRevision::query()->sole()->standard_units);
    }

    private function definition(): array
    {
        return ['title' => 'Distributed Systems', 'description' => 'Coordinate independent nodes.', 'standard_units' => '3.12345678'];
    }
}
