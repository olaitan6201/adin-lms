<?php

namespace App\Http\Controllers\Assessment;

use App\Http\Resources\Assessment\GradeInputResource;
use App\Models\AuditLog;
use App\Models\Grade;
use App\Models\GradeBoundary;
use App\Policies\AssessmentItemPolicy;
use App\Services\Assessment\FrozenGradeInputs;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\Response;

class ModerationEvidenceController
{
    public function __invoke(Request $request, Grade $grade, AssessmentItemPolicy $access): Response
    {
        abort_unless($access->examOfficer($request->user()), 404);
        $enrolment = $grade->enrolment;
        $inputs = app(FrozenGradeInputs::class)->forGrade($grade);
        $response = Inertia::render('Assessments/Moderation', [
            'desk' => route('assessment.desk', $enrolment->offering_id, false),
            'learner' => $enrolment->student->matric_number,
            'grade' => $grade->only('id', 'revision', 'grade', 'moderation_status', 'total_percent', 'published_at'),
            'inputs' => GradeInputResource::collection($inputs)->resolve($request),
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
