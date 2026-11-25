<?php

namespace App\Http\Controllers\Assessment;

use App\Enums\EnrolmentStatus;
use App\Http\Requests\Assessment\SubmissionMarkRequest;
use App\Http\Requests\Assessment\SubmissionRequest;
use App\Models\Assignment;
use App\Models\AssignmentReference;
use App\Models\Enrolment;
use App\Models\File;
use App\Models\GroupMember;
use App\Models\SubmissionFile;
use App\Models\SubmissionRecipient;
use App\Models\SubmissionVersion;
use App\Policies\AssessmentItemPolicy;
use App\Services\Assessment\PrivateScripts;
use App\Services\Assessment\ScoreLedger;
use App\Services\Assessment\SubmissionIntake;
use App\Services\Assessment\SubmissionVisibility;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class AssignmentController
{
    public function __construct(private SubmissionVisibility $visibility) {}

    public function show(Request $request, Assignment $assignment, AssessmentItemPolicy $access): Response
    {
        $item = $assignment->item;
        $learner = $access->learner($request->user(), $item->gradebook->offering_id)->first();
        $marker = Gate::allows('mark', $item);
        abort_unless($marker || ($learner && now()->gte($assignment->opens_at)), 404);
        $versions = $this->visibility->versions($assignment, $marker, $learner?->id);
        $received = SubmissionRecipient::whereIn('version_id', (clone $versions)->select('id'))->select('enrolment_id');
        $pending = $marker ? Enrolment::where('offering_id', $item->gradebook->offering_id)
            ->where('status', EnrolmentStatus::Registered)
            ->whereNotIn('id', $received)
            ->with('student:id,matric_number')
            ->get()
            ->pluck('student.matric_number') : [];

        $rows = $versions->latest('submitted_at')->get()->map(function ($version) use ($assignment, $learner, $marker) {
            $scores = $this->visibility->scores($marker, $learner?->id)
                ->where('submission_version_id', $version->id)
                ->latest('revision')
                ->get([
                    'id',
                    'points',
                    'feedback',
                    'marked_file_id',
                    'revision',
                    'released_at',
                ]);
            $this->visibility->criterionFeedback($scores);

            return $version->only('id', 'revision', 'receipt', 'body') + [
                'late' => $version->submitted_at->gt($assignment->due_at),
                'scores' => $scores,
                'recipients' => $marker ? SubmissionRecipient::where('version_id', $version->id)
                    ->with('enrolment.student:id,matric_number')
                    ->get()
                    ->pluck('enrolment.student.matric_number') : [],
                'files' => SubmissionFile::where('version_id', $version->id)->pluck('file_id'),
            ];
        });

        return Inertia::render('Assessments/Assignment', [
            'assignment' => $assignment->only('id', 'instructions', 'group_work', 'due_at', 'closes_at',
                'accepted_formats', 'max_bytes', 'editable', 'late_policy'),
            'title' => $item->title,
            'rubric' => $item->rubric,
            'marker' => $marker,
            'pending' => $pending,
            'rows' => $rows,
            'references' => AssignmentReference::where('assignment_id', $assignment->id)->pluck('file_id'),
            'groups' => $learner ? GroupMember::where('enrolment_id', $learner->id)
                ->with('group:id,name')
                ->get()
                ->pluck('group') : [],
        ]);
    }

    public function submit(
        SubmissionRequest $request,
        Assignment $assignment,
        SubmissionIntake $intake,
    ): RedirectResponse {
        $intake->accept(
            $assignment,
            $request->user(),
            $request->validated('body'),
            $request->file('script'),
            $request->validated('group_id'),
        );

        return back();
    }

    public function mark(
        SubmissionMarkRequest $request,
        SubmissionVersion $version,
        ScoreLedger $ledger,
        PrivateScripts $files,
    ): RedirectResponse {
        $item = $version->submission->assignment->item;
        Gate::authorize('mark', $item);
        $data = $request->validated();
        DB::transaction(function () use ($request, $data, $files, $version, $ledger, $item) {
            $marked = $request->file('script') ? $files->store($request->file('script'))->id : null;
            foreach (SubmissionRecipient::where('version_id', $version->id)
                ->orderBy('enrolment_id')
                ->pluck('enrolment_id') as $id) {
                $ledger->append($item, $id, (string) $data['points'], $data['reason'], $request->user()->id, [
                    'submission_version_id' => $version->id,
                    'marked_file_id' => $marked,
                    'feedback' => $data['feedback'] ?? null,
                    'released_at' => $request->boolean('release') ? now() : null,
                ]);
            }
        });

        return back();
    }

    public function download(
        Request $request,
        Assignment $assignment,
        File $file,
        AssessmentItemPolicy $access,
        PrivateScripts $files,
    ): StreamedResponse {
        $marker = Gate::allows('mark', $assignment->item);
        $id = $access->learner($request->user(), $assignment->item->gradebook->offering_id)->value('id');
        abort_unless($marker || ($id && now()->gte($assignment->opens_at)), 404);
        abort_unless($this->visibility->canDownload($assignment, $file, $marker, $id), 404);

        return $files->download($file);
    }
}
