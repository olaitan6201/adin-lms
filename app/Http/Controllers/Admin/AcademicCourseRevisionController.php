<?php

namespace App\Http\Controllers\Admin;

use App\Http\Requests\Admin\AcademicCourseRevisionRequest;
use App\Http\Requests\Admin\StoreAcademicCourseRequest;
use App\Models\Course;
use App\Models\CourseRevision;
use App\Services\Academics\CourseRevisionWorkflow;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

final class AcademicCourseRevisionController
{
    public function __construct(private CourseRevisionWorkflow $workflow) {}

    public function storeCourse(StoreAcademicCourseRequest $request): RedirectResponse
    {
        $data = $request->validated();
        $course = $this->workflow->createCourse($request->user(), $data['department_id'], $data['code']);

        return to_route('admin.academic-core', ['course' => $course->id]);
    }

    public function store(AcademicCourseRevisionRequest $request, Course $course): RedirectResponse
    {
        $this->workflow->draft($request->user(), $course, $request->validated());

        return to_route('admin.academic-core', ['course' => $course->id]);
    }

    public function update(AcademicCourseRevisionRequest $request, CourseRevision $revision): RedirectResponse
    {
        $this->workflow->update($request->user(), $revision, $request->validated());

        return to_route('admin.academic-core', ['course' => $revision->course_id]);
    }

    public function review(Request $request, CourseRevision $revision): RedirectResponse
    {
        $this->workflow->review($request->user(), $revision);

        return to_route('admin.academic-core', ['course' => $revision->course_id]);
    }

    public function approve(Request $request, CourseRevision $revision): RedirectResponse
    {
        $this->workflow->approve($request->user(), $revision);

        return to_route('admin.academic-core', ['course' => $revision->course_id]);
    }
}
