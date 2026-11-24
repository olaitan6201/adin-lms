<?php

namespace App\Http\Controllers\Assessment;

use App\Models\AssessmentItem;
use App\Models\Enrolment;
use App\Models\Grade;
use App\Models\Gradebook;
use App\Models\GradeInput;
use App\Policies\AssessmentItemPolicy;
use App\Services\Assessment\GradeCalculation;
use App\Services\Assessment\ScoreLedger;
use App\Services\Authority\ScopedAuthority;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;

class GradebookController
{
    public function score(Request $request, AssessmentItem $item, ScoreLedger $scores): RedirectResponse
    {
        Gate::authorize('mark', $item);
        abort_unless(in_array($item->kind, ['manual', 'attendance', 'continuous'], true), 422);
        $data = $request->validate(['enrolment' => 'required|uuid', 'points' => 'required|decimal:0,8|min:0', 'reason' => 'required|string|max:2000']);
        DB::transaction(fn () => $scores->append($item, $data['enrolment'], (string) $data['points'], $data['reason'], $request->user()->id));

        return back();
    }

    public function compute(Request $request, Gradebook $book, Enrolment $enrolment, AssessmentItemPolicy $access, GradeCalculation $calculator): RedirectResponse
    {
        abort_unless($access->teaches($request->user(), $book->offering), 403);
        $calculator->compute($book, $enrolment, $request->user());

        return back();
    }

    public function review(Request $request, Grade $grade, ScopedAuthority $authority, ScoreLedger $ledger): RedirectResponse
    {
        abort_unless($authority->institutionAllows($request->user(), 'examinations.manage'), 403);
        $data = $request->validate(['decision' => 'required|in:correct,approve,publish', 'reason' => 'required|string|max:2000']);
        DB::transaction(function () use ($grade, $data, $ledger, $request) {
            Enrolment::lockForUpdate()->findOrFail($grade->enrolment_id);
            $grade = Grade::lockForUpdate()->findOrFail($grade->id);
            abort_if($grade->published_at || Grade::where('enrolment_id', $grade->enrolment_id)->where('revision', '>', $grade->revision)->exists(), 409);
            $actor = $request->user()->id;
            if ($data['decision'] === 'publish') {
                abort_unless($grade->moderation_status === 'approved' && $grade->approved_at && $grade->approved_by, 409, 'Approval required.');
                $grade->forceFill(['published_at' => now()]);
            } else {
                abort_unless($grade->moderation_status === 'pending', 409, 'Compute a new revision for corrections.');
                $approve = $data['decision'] === 'approve';
                $grade->forceFill(['moderated_by' => $actor, 'moderated_at' => now(), 'moderation_note' => $data['reason'], 'moderation_status' => $approve ? 'approved' : 'correction_requested', 'approved_by' => $approve ? $actor : null, 'approved_at' => $approve ? now() : null]);
            }
            $grade->save();
            $ledger->audit('grade.'.$data['decision'], $grade->id, $actor, ['reason' => $data['reason']]);
        });

        return back();
    }

    public function sheet(Request $request, Grade $grade, AssessmentItemPolicy $access, ScopedAuthority $authority, ScoreLedger $ledger): Response
    {
        abort_unless($grade->approved_by && $grade->approved_at && $grade->moderation_status === 'approved' && $grade->published_at?->lte(now()), 404);
        $offering = $grade->enrolment->offering;
        abort_unless($access->learner($request->user(), $offering->id)->whereKey($grade->enrolment_id)->exists() || $access->teaches($request->user(), $offering) || $authority->institutionAllows($request->user(), 'examinations.manage'), 404);
        $inputs = GradeInput::where('grade_id', $grade->id)->with('score.item')->get()->map(fn ($i) => ['item' => $i->score->item->title, 'score_revision' => $i->score->revision, 'points' => (string) $i->score->points, 'maximum' => (string) $i->maximum_score, 'weight' => (string) $i->applied_weight]);
        $ledger->audit('grade.export', $grade->id, $request->user()->id);

        return response(json_encode(['enrolment' => $grade->enrolment_id, 'policy' => $grade->policy_id, 'revision' => $grade->revision, 'total' => (string) $grade->total_percent, 'grade' => $grade->grade, 'inputs' => $inputs], JSON_PRETTY_PRINT | JSON_THROW_ON_ERROR), 200, ['Content-Type' => 'application/json', 'Cache-Control' => 'private, no-store', 'Content-Disposition' => 'attachment; filename="result-'.$grade->id.'.json"']);
    }
}
