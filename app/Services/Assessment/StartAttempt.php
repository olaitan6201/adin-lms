<?php

namespace App\Services\Assessment;

use App\Enums\Assessment\AssessmentEvent;
use App\Enums\Assessment\AttemptState;
use App\Models\Accommodation;
use App\Models\Examination;
use App\Models\ExaminationAttempt;
use App\Models\User;
use App\Policies\AssessmentItemPolicy;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class StartAttempt
{
    public function __construct(
        private AssessmentItemPolicy $access,
        private ExamPaper $paper,
        private ScoreLedger $ledger,
    ) {}

    public function run(User $user, Examination $exam): ExaminationAttempt
    {
        return DB::transaction(function () use ($exam, $user) {
            if (DB::getDriverName() === 'sqlite') {
                // SQLite ignores FOR UPDATE. Reserve its writer before opening a read snapshot.
                Examination::whereKey($exam->id)->update(['max_attempts' => DB::raw('max_attempts')]);
            }

            $exam = Examination::lockForUpdate()->findOrFail($exam->id);
            $learner = $this->access->learner($user, $exam->item->gradebook->offering_id)
                ->lockForUpdate()
                ->firstOrFail();
            $rules = Accommodation::where('exam_id', $exam->id)
                ->where('enrolment_id', $learner->id)
                ->first()?->overrides ?? [];
            $closes = Carbon::parse($rules['closes_at'] ?? $exam->closes_at);
            $attempts = ExaminationAttempt::where('exam_id', $exam->id)->where('enrolment_id', $learner->id);
            $last = $attempts->latest('ordinal')->lockForUpdate()->first();
            if ($last && ! $last->submitted_at) {
                return $last;
            }

            abort_unless(
                now()->gte(Carbon::parse($rules['opens_at'] ?? $exam->opens_at)) && now()->lt($closes),
                422,
                'Exam is closed.',
            );
            $next = 1 + ($last->ordinal ?? 0);
            abort_if($next > ($rules['max_attempts'] ?? $exam->max_attempts), 409, 'Attempt limit reached.');
            $attempt = ExaminationAttempt::forceCreate([
                'exam_id' => $exam->id,
                'enrolment_id' => $learner->id,
                'ordinal' => $next,
                'started_at' => now(),
                'expires_at' => now()->addSeconds($rules['duration_seconds'] ?? $exam->duration_seconds)->min($closes),
                'state' => AttemptState::Active,
            ]);
            $this->paper->generate($attempt);
            $this->ledger->audit(AssessmentEvent::ExamStarted, $attempt->id, $user->id, [], $attempt->id);

            return $attempt;
        }, 3);
    }
}
