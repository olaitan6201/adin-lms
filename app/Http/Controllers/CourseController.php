<?php

namespace App\Http\Controllers;

use App\Enums\EnrolmentStatus;
use App\Models\Module;
use App\Policies\LearningPolicy;
use App\Services\Authority\ScopedAuthority;
use Illuminate\Database\Query\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class CourseController extends Controller
{
    public function index(Request $request, ScopedAuthority $authority): Response
    {
        return Inertia::render('Courses', [
            'historyUrl' => $request->user()->student ? route('students.history', $request->user()->student) : null,
            'staffUrl' => $authority->institutionAllows($request->user(), 'staff.manage') ? route('staff.index') : null,
            'courses' => $this->accessibleCourses($request)->orderBy('offerings.external_offering_id')->get(),
        ]);
    }

    public function show(Request $request, string $offering, LearningPolicy $release): Response
    {
        $course = $this->accessibleCourses($request)->where('offerings.id', $offering)->first();
        abort_if($course === null, 404);

        $teaching = $this->teaching($request)->where('teaching_allocations.offering_id', $offering)->exists();
        $modules = $teaching || $course->status === 'published'
            ? Module::where('offering_id', $offering)->orderBy('position')->get()
                ->filter(fn (Module $module) => $teaching || $release->released($module))
                ->values()->map->only(['id', 'kind', 'title', 'body'])
            : [];

        return Inertia::render('Course', ['course' => $course, 'teaching' => $teaching,
            'modules' => $modules]);
    }

    private function accessibleCourses(Request $request): Builder
    {
        $registered = DB::table('enrolments')
            ->join('students', 'students.id', '=', 'enrolments.student_id')
            ->where('students.user_id', $request->user()->id)
            ->where('enrolments.status', EnrolmentStatus::Registered->value)
            ->select('enrolments.offering_id');

        return DB::table('offerings')->leftJoin('curriculum_courses', 'curriculum_courses.id', '=', 'offerings.curriculum_course_id')
            ->where(fn ($q) => $q->whereIn('offerings.id', $registered)->orWhereIn('offerings.id', $this->teaching($request)))
            ->select('offerings.id', 'offerings.external_offering_id', 'offerings.status', 'offerings.delivery_mode', 'offerings.section', 'curriculum_courses.title');
    }

    private function teaching(Request $request): Builder
    {
        return DB::table('teaching_allocations')
            ->join('lecturers', 'lecturers.id', '=', 'teaching_allocations.lecturer_id')
            ->join('access_scopes', 'access_scopes.offering_id', '=', 'teaching_allocations.offering_id')
            ->join('role_grants', 'scope_id', '=', 'access_scopes.id')
            ->join('roles', 'roles.id', '=', 'role_grants.role_id')
            ->join('role_permissions', 'role_permissions.role_id', '=', 'roles.id')
            ->join('permissions', 'permissions.id', '=', 'role_permissions.permission_id')
            ->where('lecturers.user_id', $request->user()->id)->where('role_grants.user_id', $request->user()->id)
            ->where('roles.code', 'lecturer')->where('permissions.code', 'roster.read')->select('teaching_allocations.offering_id');
    }
}
