<?php

namespace App\Http\Controllers;

use App\Enums\EnrolmentStatus;
use App\Enums\OfferingStatus;
use App\Http\Requests\CourseSearchRequest;
use Illuminate\Database\Query\Builder;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class CourseSearchController extends Controller
{
    public function __invoke(CourseSearchRequest $request): Response
    {
        $term = trim($request->validated('q') ?? '');
        $match = '%'.strtr(mb_strtolower($term), ['!' => '!!', '%' => '!%', '_' => '!_']).'%';
        $results = $term === '' ? collect() : DB::table('offerings')
            ->join('enrolments', 'enrolments.offering_id', '=', 'offerings.id')
            ->join('students', 'students.id', '=', 'enrolments.student_id')
            ->join('curriculum_courses', 'curriculum_courses.id', '=', 'offerings.curriculum_course_id')
            ->join('courses', 'courses.id', '=', 'curriculum_courses.course_id')
            ->where('students.user_id', $request->user()->id)
            ->where('enrolments.status', EnrolmentStatus::Registered->value)
            ->where('offerings.status', OfferingStatus::Published->value)
            ->where(function (Builder $query) use ($match): void {
                $query->whereRaw("lower(courses.code) like ? escape '!'", [$match])
                    ->orWhereRaw("lower(curriculum_courses.title) like ? escape '!'", [$match])
                    ->orWhereRaw("lower(offerings.external_offering_id) like ? escape '!'", [$match]);
            })
            ->orderBy('courses.code')->orderBy('offerings.id')->limit(26)
            ->get(['offerings.id', 'courses.code', 'curriculum_courses.title', 'offerings.external_offering_id']);

        return Inertia::render('CourseSearch', [
            'term' => $term,
            'matches' => $results->take(25)->values(),
            'truncated' => $results->count() > 25,
        ]);
    }
}
