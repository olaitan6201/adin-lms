<?php

namespace App\Http\Controllers\Assessment;

use App\Models\AssessmentItem;
use App\Models\AssessmentScore;
use App\Models\Assignment;
use App\Models\Examination;
use App\Models\ExaminationAttempt;
use App\Models\Grade;
use App\Models\Gradebook;
use App\Models\Offering;
use App\Policies\AssessmentItemPolicy;
use App\Services\Authority\ScopedAuthority;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AssessmentDeskController
{
    public function __invoke(Request $request, Offering $offering, AssessmentItemPolicy $access, ScopedAuthority $authority): Response
    {
        $teacher = $access->teaches($request->user(), $offering);
        $officer = $authority->institutionAllows($request->user(), 'examinations.manage');
        $learner = $access->learner($request->user(), $offering->id)->first();
        abort_unless($teacher || $officer || $learner, 404);
        $book = Gradebook::where('offering_id', $offering->id)->first();
        $items = AssessmentItem::where('gradebook_id', $book?->id)->get()->map(function ($i) use ($teacher, $learner) {
            $assignment = Assignment::where('item_id', $i->id)->when(! $teacher, fn ($q) => $q->where('opens_at', '<=', now()))->value('id');
            $exam = Examination::where('item_id', $i->id)->value('id');
            $attempts = $teacher && $exam ? ExaminationAttempt::where('exam_id', $exam)->whereNotNull('submitted_at')->get(['id', 'ordinal', 'enrolment_id', 'state']) : [];
            $score = $learner ? AssessmentScore::where('item_id', $i->id)->where('enrolment_id', $learner->id)->where('released_at', '<=', now())->latest('revision')->value('points') : null;

            return $i->only('id', 'title', 'kind', 'maximum_score', 'weight_percent', 'rubric') + ['assignment' => $assignment, 'exam' => $exam, 'attempts' => $attempts, 'returned' => $score];
        });
        $roster = $offering->enrolments()->where('status', 'registered');
        $grades = Grade::whereIn('enrolment_id', (clone $roster)->select('id'))->when(! $teacher && ! $officer, fn ($q) => $q->where('enrolment_id', $learner->id)->whereNotNull('approved_at')->whereNotNull('approved_by')->where('moderation_status', 'approved')->where('published_at', '<=', now()))->latest('revision')->get(['id', 'enrolment_id', 'revision', 'grade', 'total_percent', 'moderation_status', 'published_at', 'moderation_note']);

        return Inertia::render('Assessments/Desk', ['offering' => $offering->id, 'book' => $book?->id, 'items' => $items, 'grades' => $grades, 'teacher' => $teacher, 'officer' => $officer, 'learner' => (bool) $learner, 'roster' => $teacher || $officer ? $roster->with('student:id,matric_number')->get(['id', 'student_id'])->map(fn ($e) => ['id' => $e->id, 'name' => $e->student->matric_number]) : []]);
    }
}
