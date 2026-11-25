<?php

namespace App\Http\Controllers\Assessment;

use App\Enums\EnrolmentStatus;
use App\Models\Grade;
use App\Models\Gradebook;
use App\Models\Offering;
use App\Policies\AssessmentItemPolicy;
use App\Services\Assessment\DeskItems;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AssessmentDeskController
{
    public function __invoke(
        Request $request,
        Offering $offering,
        AssessmentItemPolicy $access,
        DeskItems $items,
    ): Response {
        $teacher = $access->teaches($request->user(), $offering);
        $officer = $access->examOfficer($request->user());
        $learner = $access->learner($request->user(), $offering->id)->first();
        abort_unless($teacher || $officer || $learner, 404);
        $book = Gradebook::where('offering_id', $offering->id)->first();
        $roster = $offering->enrolments()->where('status', EnrolmentStatus::Registered);
        $results = Grade::whereIn('enrolment_id', (clone $roster)->select('id'));

        if (! $teacher && ! $officer) {
            $results->published()->where('enrolment_id', $learner->id);
        }

        $grades = $results->latest('revision')->get([
            'id',
            'enrolment_id',
            'revision',
            'grade',
            'total_percent',
            'moderation_status',
            'published_at',
            'moderation_note',
        ]);

        if (! $teacher && ! $officer) {
            $grades->makeHidden('moderation_note');
        }

        return Inertia::render('Assessments/Desk', [
            'offering' => $offering->id,
            'book' => $book?->id,
            'items' => $items->forViewer($book, $teacher, $learner),
            'grades' => $grades,
            'teacher' => $teacher,
            'officer' => $officer,
            'learner' => (bool) $learner,
            'roster' => $teacher || $officer ? $roster->with('student:id,matric_number')
                ->get(['id', 'student_id'])
                ->map(fn ($e) => [
                    'id' => $e->id,
                    'name' => $e->student->matric_number,
                ]) : [],
        ]);
    }
}
