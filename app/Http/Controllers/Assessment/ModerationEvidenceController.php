<?php

namespace App\Http\Controllers\Assessment;

use App\Http\Resources\Assessment\GradeInputResource;
use App\Models\AuditLog;
use App\Models\Grade;
use App\Models\GradeBoundary;
use App\Policies\AssessmentItemPolicy;
use App\Services\Assessment\FrozenGradeInputs;
use App\Services\Assessment\SubmissionVisibility;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\Response;

class ModerationEvidenceController
{
    public function __invoke(Request $request, Grade $grade, AssessmentItemPolicy $access): Response
    {
        abort_unless($access->examOfficer($request->user()), 404);
        $enrolment = $grade->enrolment;
        $inputs = app(FrozenGradeInputs::class)->forGrade($grade, withMarker: true);
        $scores = $inputs->pluck('score');
        app(SubmissionVisibility::class)->criterionFeedback($scores);
        $response = Inertia::render('Assessments/Moderation', [
            'desk' => route('assessment.desk', $enrolment->offering_id, false),
            'learner' => $enrolment->student->matric_number,
            'grade' => $grade->only('id', 'revision', 'grade', 'moderation_status', 'total_percent', 'published_at'),
            'superseded' => Grade::where('enrolment_id', $grade->enrolment_id)->where('revision', '>', $grade->revision)->exists(),
            'inputs' => $inputs->map(fn ($input) => (new GradeInputResource($input))->resolve($request) + [
                'marker' => $input->score->changedBy?->full_name,
                'reason' => $input->score->reason,
                'criteria' => $input->score->criteria,
            ]),
            'policy' => $grade->policy->only('version', 'rounding_rule'),
            'boundaries' => GradeBoundary::where('policy_id', $grade->policy_id)
                ->orderByDesc('minimum_percent')->get(['minimum_percent', 'grade']),
            'history' => AuditLog::where('subject_key', $grade->id)->orderBy('id')
                ->with('actor:id,full_name')->get()->map(fn ($event) => [
                    'action' => $event->action,
                    'at' => $event->occurred_at,
                    'actor' => $event->actor?->full_name,
                    'reason' => $event->details['reason'] ?? null,
                ]),
        ])->toResponse($request);
        $response->headers->set('Cache-Control', 'private, no-store');

        return $response;
    }
}
