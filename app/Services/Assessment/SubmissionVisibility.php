<?php

namespace App\Services\Assessment;

use App\Models\AssessmentCriterionFeedback;
use App\Models\AssessmentScore;
use App\Models\Assignment;
use App\Models\AssignmentReference;
use App\Models\File;
use App\Models\SubmissionFile;
use App\Models\SubmissionRecipient;
use App\Models\SubmissionVersion;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;

class SubmissionVisibility
{
    public function versions(Assignment $assignment, bool $marker, ?string $learner): Builder
    {
        $versions = SubmissionVersion::whereHas('submission', fn ($q) => $q->where('assignment_id', $assignment->id));

        if (! $marker) {
            $recipients = SubmissionRecipient::where('enrolment_id', $learner)->select('version_id');
            $versions->whereIn('id', $recipients);
        }

        return $versions;
    }

    public function scores(bool $marker, ?string $learner): Builder
    {
        $scores = AssessmentScore::query();

        if (! $marker) {
            $scores->where('enrolment_id', $learner)->where('released_at', '<=', now());
        }

        return $scores;
    }

    public function criterionFeedback(Collection $scores): void
    {
        $feedback = AssessmentCriterionFeedback::whereIn('score_id', $scores->pluck('id'))
            ->orderBy('position')->get(['score_id', 'criterion_title', 'level_label', 'points', 'feedback'])
            ->groupBy('score_id');
        foreach ($scores as $score) {
            $score->setRelation('criteria', $feedback->get($score->id, collect()));
        }
    }

    public function canDownload(Assignment $assignment, File $file, bool $marker, ?string $learner): bool
    {
        $reference = AssignmentReference::where('assignment_id', $assignment->id)->where('file_id', $file->id);

        if ($reference->exists()) {
            return true;
        }

        $versions = $this->versions($assignment, $marker, $learner)->select('id');
        $scripts = SubmissionFile::whereIn('version_id', $versions)->where('file_id', $file->id);

        return $scripts->exists() || $this->scores($marker, $learner)
            ->whereIn('submission_version_id', $versions)
            ->where('marked_file_id', $file->id)
            ->exists();
    }
}
