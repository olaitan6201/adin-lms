<?php

namespace App\Http\Controllers;

use App\Enums\EnrolmentStatus;
use App\Models\LessonProgress;
use App\Models\Student;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Gate;

class GuardianProgressController extends Controller
{
    /**
     * Handle the incoming request.
     */
    public function __invoke(Student $student): JsonResponse
    {
        Gate::authorize('viewCompletedLessons', $student);
        $completed = LessonProgress::query()
            ->join('enrolments', 'enrolments.id', '=', 'lesson_progress.enrolment_id')
            ->join('modules', 'modules.id', '=', 'lesson_progress.module_id')
            ->whereColumn('modules.offering_id', 'enrolments.offering_id')
            ->where('enrolments.student_id', $student->id)->where('enrolments.status', EnrolmentStatus::Registered)
            ->whereNotNull('lesson_progress.completed_at')->count();

        return response()->json(['completed_lessons' => $completed]);
    }
}
