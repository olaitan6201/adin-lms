<?php

namespace App\Http\Controllers\Assessment;

use App\Models\AttemptQuestion;
use App\Models\Examination;
use App\Models\ExaminationAttempt;
use App\Models\ExaminationResponse;
use App\Services\Assessment\ExamSession;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ExamSessionController
{
    public function start(Request $request, Examination $exam, ExamSession $sessions): RedirectResponse
    {
        return to_route('assessment.paper', $sessions->start($request->user(), $exam));
    }

    public function show(Request $request, ExaminationAttempt $attempt, ExamSession $sessions): Response
    {
        $sessions->authorize($request->user(), $attempt);
        if (! $attempt->submitted_at && now()->gte($attempt->expires_at)) {
            $sessions->finish($attempt);
            $attempt->refresh();
        }
        $questions = AttemptQuestion::with('version:id,prompt,kind')->where('attempt_id', $attempt->id)->orderBy('position')->get()->map(function ($q) {
            $response = ExaminationResponse::where('attempt_question_id', $q->id)->latest('revision')->first();

            return ['id' => $q->id, 'prompt' => $q->version->prompt, 'options' => $q->option_order, 'value' => $response?->answer['value'] ?? '', 'revision' => $response?->revision ?? 0];
        });

        return Inertia::render('Assessments/Paper', ['attempt' => $attempt->only('id', 'state', 'expires_at'), 'questions' => $questions, 'title' => $attempt->exam->item->title]);
    }

    public function save(Request $request, ExaminationAttempt $attempt, string $question, ExamSession $sessions): JsonResponse
    {
        $input = $request->validate(['revision' => 'required|integer|min:0', 'answer' => 'present|nullable|string|max:100000']);

        return response()->json(['revision' => $sessions->save($request->user(), $attempt, $question, (int) $input['revision'], (string) $input['answer'])]);
    }

    public function finish(Request $request, ExaminationAttempt $attempt, ExamSession $sessions): RedirectResponse
    {
        $sessions->finish($attempt, $request->user());

        return to_route('assessment.paper', $attempt);
    }
}
