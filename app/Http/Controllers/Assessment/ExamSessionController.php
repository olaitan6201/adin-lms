<?php

namespace App\Http\Controllers\Assessment;

use App\Http\Requests\Assessment\AnswerSaveRequest;
use App\Http\Resources\Assessment\CandidateQuestionResource;
use App\Models\AttemptQuestion;
use App\Models\Examination;
use App\Models\ExaminationAttempt;
use App\Services\Assessment\ExamSession;
use App\Services\Assessment\StartAttempt;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ExamSessionController
{
    public function start(Request $request, Examination $exam, StartAttempt $start): RedirectResponse
    {
        return to_route('assessment.paper', $start->run($request->user(), $exam));
    }

    public function show(Request $request, ExaminationAttempt $attempt, ExamSession $sessions): Response
    {
        $sessions->authorize($request->user(), $attempt);
        if (! $attempt->submitted_at && now()->gte($attempt->expires_at)) {
            $sessions->finish($attempt);
            $attempt->refresh();
        }

        $questions = AttemptQuestion::with(['version:id,prompt,kind,marking_key', 'latestResponse'])
            ->where('attempt_id', $attempt->id)
            ->orderBy('position')
            ->get();

        return Inertia::render('Assessments/Paper', [
            'attempt' => $attempt->only('id', 'expires_at') + ['state' => $attempt->state->value],
            'questions' => CandidateQuestionResource::collection($questions)->resolve($request),
            'title' => $attempt->exam->item->title,
            'integrity' => [
                'observe_visibility' => (bool) ($attempt->exam->security_policy['observe_visibility'] ?? false),
                'prevent_copy' => (bool) ($attempt->exam->security_policy['prevent_copy'] ?? false),
            ],
        ]);
    }

    public function save(
        AnswerSaveRequest $request,
        ExaminationAttempt $attempt,
        string $question,
        ExamSession $sessions,
    ): JsonResponse {
        $input = $request->validated();

        $revision = $sessions->save(
            $request->user(),
            $attempt,
            $question,
            (int) $input['revision'],
            $input['answer'],
        );

        return response()->json(['revision' => $revision]);
    }

    public function finish(Request $request, ExaminationAttempt $attempt, ExamSession $sessions): RedirectResponse
    {
        $sessions->finish($attempt, $request->user());

        return to_route('assessment.paper', $attempt);
    }
}
