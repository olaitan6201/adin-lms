<?php

namespace App\Http\Controllers\Assessment;

use App\Enums\Assessment\AssessmentEvent;
use App\Http\Requests\Assessment\DirectScoreRequest;
use App\Http\Requests\Assessment\ModerationRequest;
use App\Http\Resources\Assessment\GradeInputResource;
use App\Models\AssessmentItem;
use App\Models\Enrolment;
use App\Models\Grade;
use App\Models\Gradebook;
use App\Models\GradeBoundary;
use App\Models\GradeInput;
use App\Policies\AssessmentItemPolicy;
use App\Services\Assessment\GradeCalculation;
use App\Services\Assessment\ModerateResult;
use App\Services\Assessment\ScoreLedger;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;

class GradebookController
{
    public function score(DirectScoreRequest $request, AssessmentItem $item, ScoreLedger $scores): RedirectResponse
    {
        Gate::authorize('mark', $item);
        abort_unless($item->kind->acceptsDirectScores(), 422);
        $data = $request->validated();
        DB::transaction(fn () => $scores->append(
            $item,
            $data['enrolment'],
            (string) $data['points'],
            $data['reason'],
            $request->user()->id,
        ));

        return back();
    }

    public function compute(
        Request $request,
        Gradebook $book,
        Enrolment $enrolment,
        AssessmentItemPolicy $access,
        GradeCalculation $calculator,
    ): RedirectResponse {
        abort_unless($access->teaches($request->user(), $book->offering), 403);
        $calculator->compute($book, $enrolment, $request->user());

        return back();
    }

    public function review(
        AssessmentItemPolicy $access,
        ModerationRequest $request,
        Grade $grade,
        ModerateResult $action,
    ): RedirectResponse {
        abort_unless($access->examOfficer($request->user()), 403);
        $action->run($grade, $request->validated(), $request->user());

        return back();
    }

    public function sheet(
        Request $request,
        Grade $grade,
        AssessmentItemPolicy $access,
        ScoreLedger $ledger,
    ): Response {
        abort_unless(Grade::published()->whereKey($grade->id)->exists(), 404);
        $offering = $grade->enrolment->offering;
        $user = $request->user();
        $ownsResult = $access->learner($user, $offering->id)->whereKey($grade->enrolment_id)->exists();
        $staff = $access->teaches($user, $offering) || $access->examOfficer($user);
        abort_unless($ownsResult || $staff, 404);

        $inputs = GradeInput::where('grade_id', $grade->id)
            ->orderBy('id')
            ->with('score.item')
            ->get();
        $ledger->audit(AssessmentEvent::GradeExported, $grade->id, $request->user()->id);

        return response(json_encode([
            'enrolment' => $grade->enrolment_id,
            'policy' => $grade->policy_id,
            'rounding' => $grade->policy->rounding_rule->value,
            'boundaries' => GradeBoundary::where('policy_id', $grade->policy_id)
                ->orderByDesc('minimum_percent')->get(['minimum_percent', 'grade']),
            'revision' => $grade->revision,
            'total' => (string) $grade->total_percent,
            'grade' => $grade->grade,
            'inputs' => GradeInputResource::collection($inputs)->resolve($request),
        ], JSON_PRETTY_PRINT | JSON_THROW_ON_ERROR), 200, [
            'Content-Type' => 'application/json',
            'Cache-Control' => 'private, no-store',
            'Content-Disposition' => 'attachment; filename="result-'.$grade->id.'.json"',
        ]);
    }
}
