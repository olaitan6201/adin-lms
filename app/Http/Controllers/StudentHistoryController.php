<?php

namespace App\Http\Controllers;

use App\Models\Grade;
use App\Models\Student;
use App\Models\StudentPhoto;
use App\Models\StudentSession;
use Inertia\Inertia;
use Inertia\Response;

class StudentHistoryController extends Controller
{
    public function __invoke(Student $student): Response
    {
        $enrolments = $student
            ->enrolments()
            ->join('offerings', 'offerings.id', '=', 'enrolments.offering_id')
            ->leftJoin('curriculum_courses', 'curriculum_courses.id', '=', 'offerings.curriculum_course_id')
            ->select(
                'enrolments.id',
                'enrolments.status',
                'offerings.external_offering_id',
                'curriculum_courses.title',
            )
            ->orderBy('offerings.external_offering_id')
            ->toBase()
            ->get();
        $results = Grade::published()->whereIn('enrolment_id', $enrolments->pluck('id'))
            ->orderByDesc('revision')
            ->get(['enrolment_id', 'total_percent', 'grade', 'revision'])
            ->unique('enrolment_id')
            ->keyBy('enrolment_id');
        $sessions = StudentSession::where('student_id', $student->id)
            ->join('programmes', 'programmes.id', '=', 'student_sessions.programme_id')
            ->join('departments', 'departments.id', '=', 'programmes.department_id')
            ->join('faculties', 'faculties.id', '=', 'departments.faculty_id')
            ->join('academic_sessions', 'academic_sessions.id', '=', 'student_sessions.session_id')
            ->join('academic_levels', 'academic_levels.id', '=', 'student_sessions.level_id')
            ->orderByDesc('academic_sessions.starts_on')
            ->toBase()
            ->get([
                'academic_sessions.label as session',
                'programmes.name as programme',
                'departments.name as department',
                'faculties.name as faculty',
                'academic_levels.label as level',
            ]);

        return Inertia::render('StudentHistory', [
            'student' => $student->only('matric_number', 'source_name', 'source_email') + [
                'status' => $student->status?->value,
                'photo' => StudentPhoto::where('student_id', $student->id)->exists() ? route('students.photo', $student) : null,
            ],
            'sessions' => $sessions,
            'records' => $enrolments->map(
                fn ($entry) => (array) $entry + [
                    'result' => $results->get($entry->id)?->only('grade', 'total_percent'),
                ],
            ),
        ]);
    }
}
