<?php

namespace App\Http\Controllers\Assessment;

use App\Enums\Assessment\IntegrityEvent;
use App\Models\AuditLog;
use App\Models\Examination;
use App\Models\ExaminationAttempt;
use App\Services\Assessment\ExamIntegrity;
use App\Services\Assessment\ExamSession;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response as Page;

class ExamIntegrityController
{
    public function show(Examination $exam): Page
    {
        Gate::authorize('mark', $exam->item);
        $signals = AuditLog::where('subject_key', $exam->id)->where('action', IntegrityEvent::PageHidden)
            ->with(['attempt.enrolment.student:id,matric_number'])->orderByDesc('id')->simplePaginate(30);
        $reviews = AuditLog::whereIn('subject_key', $signals->pluck('id'))->where('action', IntegrityEvent::Reviewed)
            ->with('actor:id,full_name')->get()->keyBy('subject_key');

        return Inertia::render('Assessments/Integrity', [
            'exam' => $exam->id,
            'title' => $exam->item->title,
            'policy' => $exam->security_policy ?? (object) [],
            'locked' => ExaminationAttempt::where('exam_id', $exam->id)->exists(),
            'signals' => $signals->through(fn ($s) => [
                'id' => $s->id,
                'learner' => $s->attempt->enrolment->student->matric_number,
                'ordinal' => $s->attempt->ordinal,
                'at' => $s->occurred_at,
                'note' => $reviews->get($s->id)?->details['note'] ?? null,
                'reviewer' => $reviews->get($s->id)?->actor?->full_name,
            ]),
        ]);
    }

    public function configure(Request $request, Examination $exam, ExamIntegrity $integrity): RedirectResponse
    {
        Gate::authorize('mark', $exam->item);
        $request->validate(['observe_visibility' => 'sometimes|boolean', 'prevent_copy' => 'sometimes|boolean']);
        $integrity->configure($exam, $request->user(), $request->boolean('observe_visibility'), $request->boolean('prevent_copy'));

        return back();
    }

    public function signal(Request $request, ExaminationAttempt $attempt, ExamIntegrity $integrity, ExamSession $sessions): Response
    {
        $integrity->signal($attempt, $request->user(), $sessions);

        return response()->noContent();
    }

    public function review(Request $request, Examination $exam, AuditLog $signal, ExamIntegrity $integrity): RedirectResponse
    {
        Gate::authorize('mark', $exam->item);
        $data = $request->validate(['note' => 'required|string|max:1500']);
        $integrity->review($exam, $signal, $request->user(), $data['note']);

        return back();
    }
}
