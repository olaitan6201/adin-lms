<?php

namespace App\Services\Assessment;

use App\Models\AssessmentCriterionFeedback;
use App\Models\AssessmentItem;
use App\Models\SubmissionRecipient;
use App\Models\SubmissionVersion;
use App\Models\User;
use Brick\Math\BigDecimal;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;

class RecordSubmissionMark
{
    public function __construct(
        private ScoreLedger $ledger,
        private ScoredRubric $rubric,
        private PrivateScripts $files,
    ) {}

    public function run(SubmissionVersion $version, User $actor, array $data, ?UploadedFile $script): void
    {
        DB::transaction(function () use ($actor, $data, $script, $version): void {
            $version = SubmissionVersion::lockForUpdate()->findOrFail($version->id);
            $item = AssessmentItem::lockForUpdate()->findOrFail($version->submission->assignment->item_id);
            $recipients = SubmissionRecipient::where('version_id', $version->id)
                ->orderBy('enrolment_id')->pluck('enrolment_id');
            abort_if($recipients->isEmpty(), 422, 'This submission has no frozen recipients.');
            $scored = $this->rubric->score($item->rubric, $data['selections'] ?? []);
            $points = $scored['feedback'] === [] ? (string) $data['points'] : $scored['points'];
            $this->assertPoints($item, $points);
            $marked = $script === null ? null : $this->files->store($script)->id;
            $releasedAt = ($data['release'] ?? false) ? now() : null;
            foreach ($recipients as $enrolment) {
                $score = $this->ledger->append($item, $enrolment, $points, $data['reason'], $actor->id, [
                    'submission_version_id' => $version->id,
                    'marked_file_id' => $marked,
                    'feedback' => $data['feedback'] ?? null,
                    'released_at' => $releasedAt,
                ]);
                foreach ($scored['feedback'] as $feedback) {
                    AssessmentCriterionFeedback::forceCreate(['score_id' => $score->id] + $feedback);
                }
            }
        });
    }

    private function assertPoints(AssessmentItem $item, string $points): void
    {
        $value = BigDecimal::of($points);
        abort_if(
            $value->isNegative() || $value->isGreaterThan((string) $item->maximum_score),
            422,
            'Points outside item range.',
        );
    }
}
