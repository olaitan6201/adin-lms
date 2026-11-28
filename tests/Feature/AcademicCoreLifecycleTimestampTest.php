<?php

namespace Tests\Feature;

use App\Models\AcademicLevel;
use App\Models\Course;
use App\Models\CourseRevision;
use App\Models\Curriculum;
use App\Models\CurriculumCourse;
use App\Models\Department;
use App\Models\Programme;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Tests\Support\AcademicAccess;
use Tests\TestCase;

final class AcademicCoreLifecycleTimestampTest extends TestCase
{
    use AcademicAccess, RefreshDatabase;

    public function test_server_stamps_course_creation_and_draft_revisions_through_the_existing_routes(): void
    {
        $this->academicUser();
        $this->freezeSecond();
        $created = now()->toDateTimeString();
        $this->post(route('admin.academic-core.courses.store'), [
            'department_id' => Department::factory()->create()->id,
            'code' => 'CORE-TIME',
            'created_at' => '2001-01-01',
        ])->assertSessionHasNoErrors();
        $course = Course::sole();

        $definition = ['title' => 'Draft', 'description' => 'Content', 'standard_units' => '3.25'];
        $this->post(route('admin.academic-core.revisions.store', $course), $definition)
            ->assertSessionHasNoErrors();
        $revision = CourseRevision::sole();
        $this->assertTrue(Str::isUuid($course->id, 7));
        $this->assertTrue(Str::isUuid($revision->id, 7));
        $this->assertSame($created, $course->created_at?->toDateTimeString());
        $this->assertSame($created, $revision->created_at?->toDateTimeString());
        $this->assertSame($created, $revision->updated_at?->toDateTimeString());

        $this->travel(1)->seconds();
        $this->patch(route('admin.academic-core.revisions.update', $revision), [
            'title' => 'Updated draft', 'updated_at' => '2001-01-01',
        ] + $definition)->assertSessionHasNoErrors();
        $revision->refresh();
        $this->assertSame($created, $revision->created_at->toDateTimeString());
        $this->assertSame(now()->toDateTimeString(), $revision->updated_at->toDateTimeString());
    }

    public function test_existing_legacy_curriculum_routes_stamp_versions_and_assignments(): void
    {
        $this->academicUser();
        $this->freezeSecond();
        $created = now()->toDateTimeString();
        $this->post('/academics/curriculum', [
            'programme_id' => Programme::factory()->create()->id,
            'framework_revision' => 'Legacy framework',
        ])->assertSessionHasNoErrors();
        $version = Curriculum::sole();
        $url = "/academics/curriculum/$version->id";
        $assignment = [
            'code' => 'LEGACY-TIME',
            'title' => 'Initial assignment',
            'description' => 'Content',
            'outline' => 'Core concepts',
            'level_id' => AcademicLevel::factory()->create()->id,
            'semester_position' => 1,
            'credits' => '3.25',
            'compulsory' => 1,
        ];
        $this->post("$url/entry", $assignment)->assertSessionHasNoErrors();
        $entry = CurriculumCourse::sole();
        $this->assertSame($created, $version->created_at?->toDateTimeString());
        $this->assertSame($created, Course::sole()->created_at?->toDateTimeString());
        $this->assertSame($created, $entry->created_at?->toDateTimeString());

        $this->travel(1)->seconds();
        $this->post("$url/entry", ['title' => 'Updated assignment'] + $assignment)->assertSessionHasNoErrors();
        $this->post("$url/review")->assertSessionHasNoErrors();

        $entry->refresh();
        $this->assertSame('Updated assignment', $entry->title);
        $this->assertSame($created, $entry->created_at->toDateTimeString());
        $this->assertSame(now()->toDateTimeString(), $entry->updated_at->toDateTimeString());
        $this->assertSame(now()->toDateTimeString(), $version->fresh()->updated_at->toDateTimeString());
    }
}
