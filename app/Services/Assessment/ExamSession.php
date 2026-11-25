<?php

namespace App\Services\Assessment;

use App\Enums\Assessment\AssessmentEvent;
use App\Enums\Assessment\AttemptState;
use App\Models\AttemptQuestion;
use App\Models\ExaminationAttempt;
use App\Models\ExaminationResponse;
use App\Models\User;
use App\Policies\AssessmentItemPolicy;
use Illuminate\Support\Facades\DB;

class ExamSession
{
    public function __construct(
        private AssessmentItemPolicy $access,
        private ExamPaper $paper,
        private ScoreLedger $ledger,
        private AnswerShape $answers,
    ) {}

    public function authorize(User $user, ExaminationAttempt $attempt): void
    {
        abort_unless(
            $this->access->learner($user, $attempt->exam->item->gradebook->offering_id)
                ->whereKey($attempt->enrolment_id)
                ->exists(),
            404,
        );
    }

    public function save(User $user, ExaminationAttempt $attempt, string $question, int $base, string|array|null $value): int
    {
        $result = DB::transaction(function () use ($user, $attempt, $question, $base, $value) {
            $attempt = ExaminationAttempt::lockForUpdate()->findOrFail($attempt->id);
            $this->authorize($user, $attempt);
            $q = AttemptQuestion::where('attempt_id', $attempt->id)->findOrFail($question);
            $value = $this->answers->validate($q, $value);
            $latest = (int) ExaminationResponse::where('attempt_question_id', $q->id)->max('revision');
            if ($attempt->submitted_at || now()->gte($attempt->expires_at) || $latest !== $base) {
                $this->ledger->audit(
                    AssessmentEvent::SaveRejected,
                    $attempt->id,
                    $user->id,
                    ['base' => $base],
                    $attempt->id,
                );

                return null;
            }

            ExaminationResponse::forceCreate([
                'attempt_question_id' => $q->id,
                'revision' => $latest + 1,
                'answer' => ['value' => $value],
                'saved_at' => now(),
            ]);

            return $latest + 1;
        }, 3);
        abort_if($result === null, 409, 'Answer was not saved; reload the saved paper.');

        return $result;
    }

    public function finish(ExaminationAttempt $attempt, ?User $user = null): void
    {
        DB::transaction(function () use ($attempt, $user) {
            $attempt = ExaminationAttempt::lockForUpdate()->findOrFail($attempt->id);
            if ($user) {
                $this->authorize($user, $attempt);
            } else {
                abort_if(now()->lt($attempt->expires_at), 409);
            }

            if ($attempt->submitted_at) {
                return;
            }

            $points = $this->paper->mark($attempt);
            $attempt->forceFill([
                'submitted_at' => now()->min($attempt->expires_at),
                'state' => $points === null ? AttemptState::AwaitingReview : AttemptState::Submitted,
            ])->save();
            if ($points !== null) {
                $this->ledger->append(
                    $attempt->exam->item,
                    $attempt->enrolment_id,
                    $points,
                    'Objective paper scored',
                    null,
                    ['attempt_id' => $attempt->id],
                );
            }

            $this->ledger->audit(
                AssessmentEvent::ExamSubmitted,
                $attempt->id,
                $user?->id,
                ['expired' => now()->gte($attempt->expires_at)],
                $attempt->id,
            );
        }, 3);
    }
}
