<?php

namespace App\Http\Controllers;

use App\Enums\EnrolmentStatus;
use App\Enums\PermissionCode;
use App\Enums\RoleCode;
use App\Models\Offering;
use App\Services\Authority\ScopedAuthority;
use App\Services\Learning\CourseOutline;
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
            'workloadUrl' => $request->user()->lecturer ? route('workload.index') : null,
            'historyUrl' => $request->user()->student
                ? route('students.history', $request->user()->student)
                : null,
            'staffUrl' => $authority->institutionAllows($request->user(), PermissionCode::StaffManage)
                ? route('staff.index')
                : null,
            'courses' => $this->accessibleCourses($request)->orderBy('offerings.external_offering_id')->get(),
        ]);
    }

    public function show(Request $request, Offering $offering, CourseOutline $outline): Response
    {
        $course = $this->accessibleCourses($request)->where('offerings.id', $offering->id)->first();
        abort_if($course === null, 404);

        $teaching = $this->teaching($request)->where('teaching_allocations.offering_id', $offering->id)->exists();

        return Inertia::render('Course', [
            'course' => $course,
            'teaching' => $teaching,
            'learningToolsUrl' => route('integrations.index', $offering, false),
            'packageReadingsUrl' => filled(config('scorm_runtime.origin'))
                ? route('scorm.index', $offering, false)
                : null,
            ...$outline->build($offering, $request->user(), $teaching),
        ]);
    }

    private function accessibleCourses(Request $request): Builder
    {
        $registered = DB::table('enrolments')
            ->join('students', 'students.id', '=', 'enrolments.student_id')
            ->where('students.user_id', $request->user()->id)
            ->where('enrolments.status', EnrolmentStatus::Registered->value)
            ->select('enrolments.offering_id');

        return DB::table('offerings')
            ->leftJoin('curriculum_courses', 'curriculum_courses.id', '=', 'offerings.curriculum_course_id')
            ->leftJoin('courses', 'courses.id', '=', 'curriculum_courses.course_id')
            ->where(
                fn ($q) => $q
                    ->whereIn('offerings.id', $registered)
                    ->orWhereIn('offerings.id', $this->teaching($request)),
            )
            ->select(
                'offerings.id',
                'offerings.external_offering_id',
                'offerings.status',
                'offerings.delivery_mode',
                'offerings.section',
                'curriculum_courses.title',
                'courses.code',
                'curriculum_courses.description',
                'curriculum_courses.credits',
            );
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
            ->where('lecturers.user_id', $request->user()->id)
            ->where('role_grants.user_id', $request->user()->id)
            ->where('roles.code', RoleCode::Lecturer->value)
            ->where('permissions.code', PermissionCode::RosterRead->value)
            ->select('teaching_allocations.offering_id');
    }
}
