<?php

namespace App\Http\Controllers\Assessment;

use App\Enums\Assessment\AssessmentEvent;
use App\Enums\Assessment\AttemptState;
use App\Enums\Assessment\ItemKind;
use App\Http\Requests\Assessment\AccommodationRequest;
use App\Http\Requests\Assessment\ExamSetupRequest;
use App\Http\Requests\Assessment\RecordMarkRequest;
use App\Models\Accommodation;
use App\Models\AssessmentItem;
use App\Models\AttemptQuestion;
use App\Models\Enrolment;
use App\Models\Examination;
use App\Models\ExaminationAttempt;
use App\Policies\AssessmentItemPolicy;
use App\Services\Assessment\BuildExamination;
use App\Services\Assessment\ScoreLedger;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class ExamAuthorController
{
    public function create(ExamSetupRequest $request, AssessmentItem $item, BuildExamination $action): RedirectResponse
    {
        Gate::authorize('mark', $item);
        abort_unless($item->kind === ItemKind::Exam, 422);
        $action->run($item, $request->validated());

        return back();
    }

    public function accommodate(
        AssessmentItemPolicy $access,
        AccommodationRequest $request,
        Examination $exam,
        ScoreLedger $events,
    ): RedirectResponse {
        abort_unless($access->examOfficer($request->user()), 403);
        $d = $request->validated();
        Enrolment::where('offering_id', $exam->item->gradebook->offering_id)->findOrFail($d['enrolment']);
        DB::transaction(function () use ($exam, $request, $d, $events) {
            Examination::lockForUpdate()->findOrFail($exam->id);
            $record = Accommodation::where('exam_id', $exam->id)
                ->where('enrolment_id', $d['enrolment'])
                ->first() ?? new Accommodation;
            $record->forceFill([
                'exam_id' => $exam->id,
                'enrolment_id' => $d['enrolment'],
                'approved_by' => $request->user()->id,
                'overrides' => array_diff_key($d, ['enrolment' => true]),
            ])->save();
            $events->audit(
                AssessmentEvent::AccommodationApproved,
                $record->id,
                $request->user()->id,
                $record->overrides,
            );
        });

        return back();
    }

    public function script(ExaminationAttempt $attempt): Response
    {
        Gate::authorize('mark', $attempt->exam->item);
        abort_unless($attempt->submitted_at, 409);
        $questions = AttemptQuestion::with(['version:id,prompt', 'latestResponse'])
            ->where('attempt_id', $attempt->id)
            ->orderBy('position')
            ->get()
            ->map(fn (AttemptQuestion $question) => [
                'prompt' => $question->version->prompt,
                'answer' => $question->latestResponse?->answer['value'] ?? '',
                'possible' => $question->possible_points,
                'automatic' => $question->awarded_points,
            ]);

        return Inertia::render('Assessments/MarkPaper', [
            'attempt' => $attempt->id,
            'questions' => $questions,
        ]);
    }

    public function mark(RecordMarkRequest $request, ExaminationAttempt $attempt, ScoreLedger $ledger): RedirectResponse
    {
        Gate::authorize('mark', $attempt->exam->item);
        abort_unless($attempt->submitted_at, 409);
        $data = $request->validated();
        DB::transaction(function () use ($ledger, $attempt, $request, $data) {
            $ledger->append(
                $attempt->exam->item,
                $attempt->enrolment_id,
                (string) $data['points'],
                $data['reason'],
                $request->user()->id,
                [
                    'attempt_id' => $attempt->id,
                    'released_at' => $request->boolean('release') ? now() : null,
                ]);
            $attempt->forceFill(['state' => AttemptState::Marked])->save();
        });

        return back();
    }
}
