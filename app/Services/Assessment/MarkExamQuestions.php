<?php

namespace App\Services\Assessment;

use App\Enums\Assessment\AssessmentEvent;
use App\Enums\Assessment\AttemptState;
use App\Models\AssessmentScore;
use App\Models\AttemptQuestion;
use App\Models\AuditLog;
use App\Models\ExaminationAttempt;
use App\Models\User;
use Brick\Math\BigDecimal;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

final class MarkExamQuestions
{
    public function __construct(private ScoreLedger $ledger) {}

    public function run(ExaminationAttempt $attempt, User $marker, array $data): void
    {
        DB::transaction(function () use ($attempt, $marker, $data) {
            $attempt = ExaminationAttempt::lockForUpdate()->findOrFail($attempt->id);
            abort_unless($attempt->submitted_at, 409);
            $current = (int) AssessmentScore::where('attempt_id', $attempt->id)->max('revision');
            abort_unless($current === (int) $data['base_revision'], 409, 'Another marker updated this script. Reload before marking.');
            $questions = AttemptQuestion::where('attempt_id', $attempt->id)->with('version:id,kind')
                ->orderBy('position')->lockForUpdate()->get();
            $awards = $data['awards'] ?? [];
            $snapshot = [];
            $total = BigDecimal::zero();
            foreach ($questions as $question) {
                $objective = $question->version->kind->isObjective();
                $before = $question->awarded_points;
                if (! $objective && array_key_exists($question->id, $awards)) {
                    $points = BigDecimal::of((string) $awards[$question->id]);
                    if ($points->isGreaterThan((string) $question->possible_points)) {
                        throw ValidationException::withMessages(["awards.$question->id" => 'Award exceeds the question maximum.']);
                    }

                    $question->forceFill(['awarded_points' => (string) $points])->save();
                    unset($awards[$question->id]);
                }

                if ($question->awarded_points === null) {
                    throw ValidationException::withMessages(['awards' => 'Award every subjective question before recording a score.']);
                }

                $total = $total->plus((string) $question->awarded_points);
                $snapshot[] = [
                    'question' => $question->id,
                    'version' => $question->version_id,
                    'position' => $question->position,
                    'objective' => $objective,
                    'maximum' => (string) $question->possible_points,
                    'previous' => $before === null ? null : (string) $before,
                    'points' => (string) $question->awarded_points,
                ];
            }

            if ($awards !== []) {
                throw ValidationException::withMessages(['awards' => 'Only subjective questions from this script may be scored.']);
            }

            $score = $this->ledger->append($attempt->exam->item, $attempt->enrolment_id, (string) $total,
                $data['reason'], $marker->id, [
                    'attempt_id' => $attempt->id,
                    'released_at' => ($data['release'] ?? false) ? now() : null,
                ]);
            AuditLog::forceCreate([
                'actor_id' => $marker->id, 'attempt_id' => $attempt->id, 'subject_key' => $score->id,
                'action' => AssessmentEvent::QuestionAwards->value, 'occurred_at' => now(),
                'details' => ['revision' => $score->revision, 'reason' => $data['reason'], 'awards' => $snapshot],
            ]);
            $attempt->forceFill(['state' => AttemptState::Marked])->save();
        }, 3);
    }
}
