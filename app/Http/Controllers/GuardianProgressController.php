<?php

namespace App\Http\Controllers;

use App\Enums\EnrolmentStatus;
use App\Enums\PermissionCode;
use App\Models\GuardianAccess;
use App\Models\LessonProgress;
use App\Models\Student;
use App\Services\Authority\ScopedAuthority;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class GuardianProgressController extends Controller
{
    public function index(Request $request, ScopedAuthority $authority): Response
    {
        abort_unless($authority->institutionAllows($request->user(), PermissionCode::ProgressReadApproved), 403);
        $page = GuardianAccess::where('guardian_id', $request->user()->id)->whereNotNull('approved_by')
            ->whereNull('revoked_at')->whereJsonContains('allowed_fields', 'completed_lessons')
            ->orderBy('id')->simplePaginate(25, ['id', 'student_id']);

        return Inertia::render('Guardian/Progress', [
            'approvals' => $page->getCollection()->map(fn (GuardianAccess $access) => [
                'reference' => substr($access->id, -8),
                'href' => route('guardian.progress', $access->student_id),
            ]),
            'previous' => $page->previousPageUrl(),
            'next' => $page->nextPageUrl(),
        ]);
    }

    public function __invoke(Request $request, Student $student): JsonResponse|Response
    {
        Gate::authorize('viewCompletedLessons', $student);
        $completed = LessonProgress::query()
            ->join('enrolments', 'enrolments.id', '=', 'lesson_progress.enrolment_id')
            ->join('modules', 'modules.id', '=', 'lesson_progress.module_id')
            ->whereColumn('modules.offering_id', 'enrolments.offering_id')
            ->where('enrolments.student_id', $student->id)->where('enrolments.status', EnrolmentStatus::Registered)
            ->whereNotNull('lesson_progress.completed_at')->count();

        $progress = ['completed_lessons' => $completed];

        return $request->expectsJson() && ! $request->header('X-Inertia')
            ? response()->json($progress)
            : Inertia::render('Guardian/Progress', $progress);
    }
}
