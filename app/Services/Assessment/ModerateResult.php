<?php

namespace App\Services\Assessment;

use App\Enums\Assessment\AssessmentEvent;
use App\Enums\Assessment\ModerationStatus;
use App\Enums\Assessment\ReviewDecision;
use App\Models\AssessmentScore;
use App\Models\Enrolment;
use App\Models\Grade;
use App\Models\Gradebook;
use App\Models\GradeInput;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class ModerateResult
{
    public function __construct(private ScoreLedger $ledger) {}

    public function run(Grade $grade, array $data, User $user): void
    {
        DB::transaction(function () use ($grade, $data, $user) {
            $book = Gradebook::where('offering_id', $grade->enrolment->offering_id)->lockForUpdate()->firstOrFail();
            Enrolment::lockForUpdate()->findOrFail($grade->enrolment_id);
            $grade = Grade::lockForUpdate()->findOrFail($grade->id);
            abort_if(
                $grade->published_at || Grade::where('enrolment_id', $grade->enrolment_id)
                    ->where('revision', '>', $grade->revision)
                    ->exists(),
                409,
            );
            $decision = ReviewDecision::from($data['decision']);

            if ($decision !== ReviewDecision::Correct) {
                abort_unless($book->policy_id === $grade->policy_id, 409, 'The grading policy changed. Compute a new result revision.');
                foreach (GradeInput::with('score')->where('grade_id', $grade->id)->get() as $input) {
                    abort_if(
                        AssessmentScore::where('enrolment_id', $grade->enrolment_id)
                            ->where('item_id', $input->score->item_id)
                            ->where('revision', '>', $input->score->revision)
                            ->exists(),
                        409,
                        'A mark changed. Compute a new result revision.',
                    );
                }
            }

            $actor = $user->id;
            if ($decision === ReviewDecision::Publish) {
                abort_unless(
                    $grade->moderation_status === ModerationStatus::Approved && $grade->approved_at && $grade->approved_by,
                    409,
                    'Approval required.',
                );
                $grade->forceFill(['published_at' => now()]);
            } else {
                abort_unless(
                    $grade->moderation_status === ModerationStatus::Pending,
                    409,
                    'Compute a new revision for corrections.',
                );
                $approve = $decision === ReviewDecision::Approve;
                $grade->forceFill([
                    'moderated_by' => $actor,
                    'moderated_at' => now(),
                    'moderation_note' => $data['reason'],
                    'moderation_status' => $approve ? ModerationStatus::Approved : ModerationStatus::CorrectionRequested,
                    'approved_by' => $approve ? $actor : null,
                    'approved_at' => $approve ? now() : null,
                ]);
            }

            $grade->save();
            $event = match ($decision) {
                ReviewDecision::Correct => AssessmentEvent::CorrectionRequested,
                ReviewDecision::Approve => AssessmentEvent::GradeApproved,
                ReviewDecision::Publish => AssessmentEvent::GradePublished,
            };
            $this->ledger->audit($event, $grade->id, $actor, ['reason' => $data['reason']]);
        });
    }
}
