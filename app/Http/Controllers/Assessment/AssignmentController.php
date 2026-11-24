<?php

namespace App\Http\Controllers\Assessment;

use App\Http\Requests\Assessment\SubmissionRequest;
use App\Models\AssessmentScore;
use App\Models\Assignment;
use App\Models\AssignmentReference;
use App\Models\File;
use App\Models\GroupMember;
use App\Models\SubmissionFile;
use App\Models\SubmissionRecipient;
use App\Models\SubmissionVersion;
use App\Policies\AssessmentItemPolicy;
use App\Services\Assessment\PrivateScripts;
use App\Services\Assessment\ScoreLedger;
use App\Services\Assessment\SubmissionIntake;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class AssignmentController
{
    public function show(Request $request, Assignment $assignment, AssessmentItemPolicy $access): Response
    {
        $item = $assignment->item;
        $learner = $access->learner($request->user(), $item->gradebook->offering_id)->first();
        $marker = Gate::allows('mark', $item);
        abort_unless($marker || ($learner && now()->gte($assignment->opens_at)), 404);
        $versions = SubmissionVersion::whereHas('submission', fn ($q) => $q->where('assignment_id', $assignment->id));
        if (! $marker) {
            $versions->whereIn('id', SubmissionRecipient::where('enrolment_id', $learner->id)->select('version_id'));
        }
        $rows = $versions->latest('submitted_at')->get()->map(function ($version) use ($assignment, $learner, $marker) {
            $scores = AssessmentScore::where('submission_version_id', $version->id)->when(! $marker, fn ($q) => $q->where('enrolment_id', $learner->id)->where('released_at', '<=', now()))->latest('revision')->get(['id', 'points', 'feedback', 'marked_file_id', 'revision', 'released_at']);

            return $version->only('id', 'revision', 'receipt', 'body') + ['late' => $version->submitted_at->gt($assignment->due_at), 'scores' => $scores, 'files' => SubmissionFile::where('version_id', $version->id)->pluck('file_id')];
        });

        return Inertia::render('Assessments/Assignment', ['assignment' => $assignment->only('id', 'instructions', 'group_work', 'due_at', 'closes_at'), 'title' => $item->title, 'marker' => $marker, 'rows' => $rows, 'references' => AssignmentReference::where('assignment_id', $assignment->id)->pluck('file_id'), 'groups' => $learner ? GroupMember::where('enrolment_id', $learner->id)->with('group:id,name')->get()->pluck('group') : []]);
    }

    public function submit(SubmissionRequest $request, Assignment $assignment, SubmissionIntake $intake): RedirectResponse
    {
        $intake->accept($assignment, $request->user(), $request->validated('body'), $request->file('script'), $request->validated('group_id'));

        return back();
    }

    public function mark(Request $request, SubmissionVersion $version, ScoreLedger $ledger, PrivateScripts $files): RedirectResponse
    {
        $item = $version->submission->assignment->item;
        Gate::authorize('mark', $item);
        $data = $request->validate(['points' => 'required|decimal:0,8|min:0', 'feedback' => 'nullable|string|max:30000', 'reason' => 'required|string|max:2000', 'release' => 'nullable|boolean', 'script' => 'nullable|file|mimes:pdf,txt|max:20480']);
        DB::transaction(function () use ($request, $data, $files, $version, $ledger, $item) {
            $marked = $request->file('script') ? $files->store($request->file('script'))->id : null;
            foreach (SubmissionRecipient::where('version_id', $version->id)->orderBy('enrolment_id')->pluck('enrolment_id') as $id) {
                $ledger->append($item, $id, (string) $data['points'], $data['reason'], $request->user()->id, ['submission_version_id' => $version->id, 'marked_file_id' => $marked, 'feedback' => $data['feedback'] ?? null, 'released_at' => $request->boolean('release') ? now() : null]);
            }
        });

        return back();
    }

    public function download(Request $request, Assignment $assignment, File $file, AssessmentItemPolicy $access, PrivateScripts $files): StreamedResponse
    {
        $marker = Gate::allows('mark', $assignment->item);
        $id = $access->learner($request->user(), $assignment->item->gradebook->offering_id)->value('id');
        abort_unless($marker || ($id && now()->gte($assignment->opens_at)), 404);
        $versions = SubmissionVersion::whereHas('submission', fn ($q) => $q->where('assignment_id', $assignment->id))->when(! $marker, fn ($q) => $q->whereIn('id', SubmissionRecipient::where('enrolment_id', $id)->select('version_id')))->select('id');
        abort_unless(AssignmentReference::where('assignment_id', $assignment->id)->where('file_id', $file->id)->exists() || SubmissionFile::whereIn('version_id', $versions)->where('file_id', $file->id)->exists() || AssessmentScore::whereIn('submission_version_id', $versions)->where('marked_file_id', $file->id)->when(! $marker,fn ($q) => $q->where('enrolment_id',$id)->where('released_at','<=',now()))->exists(), 404);

        return $files->download($file);
    }
}
