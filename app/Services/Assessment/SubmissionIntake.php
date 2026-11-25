<?php

namespace App\Services\Assessment;

use App\Enums\EnrolmentStatus;
use App\Models\Assignment;
use App\Models\Enrolment;
use App\Models\GroupMember;
use App\Models\Submission;
use App\Models\SubmissionFile;
use App\Models\SubmissionRecipient;
use App\Models\SubmissionVersion;
use App\Models\User;
use App\Policies\AssessmentItemPolicy;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class SubmissionIntake
{
    public function __construct(private AssessmentItemPolicy $access, private PrivateScripts $files) {}

    public function accept(
        Assignment $assignment,
        User $user,
        ?string $body,
        ?UploadedFile $file,
        ?string $group,
    ): SubmissionVersion {
        return DB::transaction(function () use ($assignment, $user, $body, $file, $group) {
            $assignment = Assignment::lockForUpdate()->findOrFail($assignment->id);
            $offering = $assignment->item->gradebook->offering_id;
            $learner = $this->access->learner($user, $offering)->lockForUpdate()->firstOrFail();
            $open = now()->gte($assignment->opens_at) && now()->lt($assignment->closes_at);
            $acceptsLate = $assignment->late_policy['allow'] ?? false;
            abort_unless($open && ($acceptsLate || now()->lte($assignment->due_at)), 422, 'Submission window closed.');
            abort_unless($assignment->group_work === ($group !== null), 422, 'Choose the required submission group.');
            $recipients = collect([$learner->id]);
            if ($group) {
                $members = GroupMember::where('group_id', $group)
                    ->whereHas('group', fn ($q) => $q
                        ->where('offering_id', $offering))
                    ->pluck('enrolment_id');
                $recipients = Enrolment::whereIn('id', $members)
                    ->where('offering_id', $offering)
                    ->where('status', EnrolmentStatus::Registered)
                    ->pluck('id');
                abort_unless($recipients->contains($learner->id), 403);
            }

            $allowsText = in_array('txt', $assignment->accepted_formats, true);
            abort_if(
                $body !== null && (! $allowsText || strlen($body) > $assignment->max_bytes),
                422,
                'Text outside assignment limits.',
            );
            abort_if(
                $file && ($file->getSize() > $assignment->max_bytes || ! in_array(
                    $file->guessExtension(),
                    $assignment->accepted_formats,
                    true,
                )),
                422,
                'File outside assignment limits.',
            );
            $key = [
                'assignment_id' => $assignment->id,
                'group_id' => $group,
                'enrolment_id' => $group ? null : $learner->id,
            ];
            $submission = Submission::where($key)->first() ?? Submission::forceCreate($key);
            $revision = 1 + SubmissionVersion::where('submission_id', $submission->id)->max('revision');
            abort_if($revision > 1 && ! $assignment->editable, 409, 'Revisions disabled.');
            $version = SubmissionVersion::forceCreate([
                'submission_id' => $submission->id,
                'revision' => $revision,
                'receipt' => (string) Str::uuid7(),
                'submitted_at' => now(),
                'submitted_by' => $user->id,
                'body' => $body,
            ]);
            foreach ($recipients as $id) {
                SubmissionRecipient::forceCreate([
                    'version_id' => $version->id,
                    'enrolment_id' => $id,
                ]);
            }

            if ($file) {
                SubmissionFile::forceCreate([
                    'version_id' => $version->id,
                    'file_id' => $this->files->store($file)->id,
                ]);
            }

            return $version;
        });
    }
}
