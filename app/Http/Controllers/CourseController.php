<?php

namespace App\Http\Controllers;

use App\Enums\EnrolmentStatus;
use Illuminate\Database\Query\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class CourseController extends Controller
{
    public function index(Request $request): Response
    {
        return Inertia::render('Courses', [
            'historyUrl' => $request->user()->student ? route('students.history', $request->user()->student) : null,
            'courses' => $this->accessibleCourses($request)->orderBy('offerings.external_offering_id')->get(),
        ]);
    }

    public function show(Request $request, string $offering): Response
    {
        $course = $this->accessibleCourses($request)->where('offerings.id', $offering)->first();
        abort_if($course === null, 404);

        return Inertia::render('Course', ['course' => $course]);
    }

    private function accessibleCourses(Request $request): Builder
    {
        return DB::table('offerings')
            ->join('enrolments', 'enrolments.offering_id', '=', 'offerings.id')
            ->join('students', 'students.id', '=', 'enrolments.student_id')
            ->where('students.user_id', $request->user()->id)
            ->where('enrolments.status', EnrolmentStatus::Registered->value)
            ->select('offerings.id', 'offerings.external_offering_id');
    }
}
