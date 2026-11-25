<?php

namespace App\Http\Controllers\Assessment;

use App\Enums\Assessment\AssessmentEvent;
use App\Enums\Assessment\ItemKind;
use App\Http\Requests\Assessment\AccommodationRequest;
use App\Http\Requests\Assessment\ExamSetupRequest;
use App\Http\Requests\Assessment\MarkExamRequest;
use App\Models\Accommodation;
use App\Models\AssessmentItem;
use App\Models\AssessmentScore;
use App\Models\AttemptQuestion;
use App\Models\AuditLog;
use App\Models\Enrolment;
use App\Models\Examination;
use App\Models\ExaminationAttempt;
use App\Policies\AssessmentItemPolicy;
use App\Services\Assessment\BuildExamination;
use App\Services\Assessment\MarkExamQuestions;
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
        $questions = AttemptQuestion::with(['version:id,prompt,kind,marking_key', 'latestResponse'])
            ->where('attempt_id', $attempt->id)
            ->orderBy('position')
            ->get()
            ->map(fn (AttemptQuestion $question) => [
                'id' => $question->id,
                'prompt' => $question->version->prompt,
                'answer' => $this->readableAnswer($question),
                'marking_guide' => $question->version->marking_key['guide'] ?? null,
                'objective' => $question->version->kind->isObjective(),
                'possible' => $question->possible_points,
                'awarded' => $question->awarded_points,
            ]);

        return Inertia::render('Assessments/MarkPaper', [
            'attempt' => $attempt->id,
            'questions' => $questions,
            'revision' => (int) AssessmentScore::where('attempt_id', $attempt->id)->max('revision'),
            'history' => AuditLog::where('attempt_id', $attempt->id)->where('action', AssessmentEvent::QuestionAwards)
                ->latest('id')->get(['details'])->pluck('details'),
        ]);
    }

    public function mark(MarkExamRequest $request, ExaminationAttempt $attempt, MarkExamQuestions $action): RedirectResponse
    {
        $action->run($attempt, $request->user(), $request->validated());

        return back();
    }

    private function readableAnswer(AttemptQuestion $question): string
    {
        $answer = $question->latestResponse?->answer['value'] ?? '';
        if (is_string($answer)) {
            return $answer;
        }
        $matching = $question->version->marking_key['matching'] ?? [];
        $left = array_column($matching['left'] ?? [], 'label', 'id');
        $right = array_column($matching['right'] ?? [], 'label', 'id');
        $pairs = [];
        foreach ($answer as $prompt => $choice) {
            $pairs[] = ($left[$prompt] ?? 'Unknown prompt').' → '.($right[$choice] ?? 'Unknown choice');
        }

        return implode("\n", $pairs);
    }
}
