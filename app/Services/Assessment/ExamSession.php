<?php

namespace App\Services\Assessment;

use App\Models\Accommodation;
use App\Models\AttemptQuestion;
use App\Models\Examination;
use App\Models\ExaminationAttempt;
use App\Models\ExaminationResponse;
use App\Models\User;
use App\Policies\AssessmentItemPolicy;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class ExamSession
{
    public function __construct(private AssessmentItemPolicy $access, private ExamPaper $paper, private ScoreLedger $ledger) {}

    public function start(User $user, Examination $exam): ExaminationAttempt
    {
        return DB::transaction(function () use ($exam, $user) {
            if (DB::getDriverName() === 'sqlite') {
                // SQLite ignores FOR UPDATE. Reserve its writer before opening a read snapshot.
                Examination::whereKey($exam->id)->update(['max_attempts' => DB::raw('max_attempts')]);
            }
            $exam = Examination::lockForUpdate()->findOrFail($exam->id);
            $learner = $this->access->learner($user, $exam->item->gradebook->offering_id)->lockForUpdate()->firstOrFail();
            $rules = Accommodation::where('exam_id', $exam->id)->where('enrolment_id', $learner->id)->first()?->overrides ?? [];
            $closes = Carbon::parse($rules['closes_at'] ?? $exam->closes_at);
            $attempts = ExaminationAttempt::where('exam_id', $exam->id)->where('enrolment_id', $learner->id);
            $last = $attempts->latest('ordinal')->lockForUpdate()->first();
            if ($last && ! $last->submitted_at) {
                return $last;
            }
            abort_unless(now()->gte(Carbon::parse($rules['opens_at'] ?? $exam->opens_at)) && now()->lt($closes), 422, 'Exam is closed.');
            $next = 1 + ($last->ordinal ?? 0);
            abort_if($next > ($rules['max_attempts'] ?? $exam->max_attempts), 409, 'Attempt limit reached.');
            $attempt = ExaminationAttempt::forceCreate(['exam_id' => $exam->id, 'enrolment_id' => $learner->id, 'ordinal' => $next, 'started_at' => now(), 'expires_at' => now()->addSeconds($rules['duration_seconds'] ?? $exam->duration_seconds)->min($closes), 'state' => 'active']);
            $this->paper->generate($attempt);
            $this->ledger->audit('exam.started', $attempt->id, $user->id, [], $attempt->id);

            return $attempt;
        }, 3);
    }

    public function authorize(User $user, ExaminationAttempt $attempt): void
    {
        abort_unless($this->access->learner($user, $attempt->exam->item->gradebook->offering_id)->whereKey($attempt->enrolment_id)->exists(), 404);
    }

    public function save(User $user, ExaminationAttempt $attempt, string $question, int $base, string $value): int
    {
        $result = DB::transaction(function () use ($user, $attempt, $question, $base, $value) {
            $attempt = ExaminationAttempt::lockForUpdate()->findOrFail($attempt->id);
            $this->authorize($user, $attempt);
            $q = AttemptQuestion::where('attempt_id', $attempt->id)->findOrFail($question);
            $latest = (int) ExaminationResponse::where('attempt_question_id', $q->id)->max('revision');
            if ($attempt->submitted_at || now()->gte($attempt->expires_at) || $latest !== $base) {
                $this->ledger->audit('exam.save_rejected', $attempt->id, $user->id, ['base' => $base], $attempt->id);

                return null;
            }
            ExaminationResponse::forceCreate(['attempt_question_id' => $q->id, 'revision' => $latest + 1, 'answer' => ['value' => $value], 'saved_at' => now()]);

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
            $attempt->forceFill(['submitted_at' => now()->min($attempt->expires_at), 'state' => $points === null ? 'awaiting_review' : 'submitted'])->save();
            if ($points !== null) {
                $this->ledger->append($attempt->exam->item, $attempt->enrolment_id, $points, 'Objective paper scored', null, ['attempt_id' => $attempt->id]);
            }
            $this->ledger->audit('exam.submitted', $attempt->id, $user?->id, ['expired' => now()->gte($attempt->expires_at)], $attempt->id);
        }, 3);
    }
}
