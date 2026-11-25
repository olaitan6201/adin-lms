<?php

namespace App\Services\Community;

use App\Models\AssessmentScore;
use App\Models\Assignment;
use App\Models\Examination;
use App\Models\SubmissionVersion;

final class ScanAssessmentNotices
{
    public function __construct(private CommunityAudience $audience, private NoticeOutbox $outbox) {}

    public function run(): void
    {
        $this->assignments();
        $this->examinations();
        $this->releasedResults();
        $this->submissions();
    }

    private function assignments(): void
    {
        $published = fn ($q) => $q->where('status', 'published');
        $assignments = Assignment::with('item.gradebook')
            ->whereHas('item.gradebook.offering', $published)
            ->where('opens_at', '<=', now())
            ->where('closes_at', '>', now());
        foreach ($assignments->lazyById() as $assignment) {
            $learners = $this->audience->learners($assignment->item->gradebook->offering_id);
            $this->outbox->record(
                clone $learners,
                'assignment:'.$assignment->id,
                'A course assignment is available.',
            );
            if ($assignment->due_at->isFuture() && $assignment->due_at->lte(now()->addDay())) {
                $this->outbox->record(
                    $learners,
                    'deadline:'.$assignment->id.':'.$assignment->due_at->timestamp,
                    'A course assignment is due within 24 hours.',
                );
            }
        }
    }

    private function examinations(): void
    {
        $scheduled = Examination::with('item.gradebook')
            ->whereHas('item.gradebook.offering', fn ($query) => $query->where('status', 'published'))
            ->where('closes_at', '>', now());

        foreach ($scheduled->lazyById() as $exam) {
            $this->outbox->record(
                $this->audience->learners($exam->item->gradebook->offering_id),
                'exam:'.$exam->id.':'.$exam->opens_at->timestamp,
                'An examination has been scheduled.',
            );
        }
    }

    private function releasedResults(): void
    {
        $scores = AssessmentScore::with(['item.gradebook', 'enrolment.student'])
            ->where('released_at', '<=', now())
            ->whereIn('item_id', Examination::select('item_id'))
            ->whereHas('item.gradebook.offering', fn ($q) => $q->where('status', 'published'));
        foreach ($scores->lazyById() as $score) {
            if ($score->enrolment->offering_id === $score->item->gradebook->offering_id) {
                $learners = $this->audience
                    ->learners($score->enrolment->offering_id)
                    ->whereKey($score->enrolment->student->user_id);
                $this->outbox->record(
                    $learners,
                    'result:'.$score->id,
                    'An examination result has been released to you.',
                );
            }
        }
    }

    private function submissions(): void
    {
        $submitted = SubmissionVersion::with('submission.assignment.item.gradebook')->where(
            'submitted_at',
            '<=',
            now(),
        );

        foreach ($submitted->lazyById() as $version) {
            $teachers = $this->audience->teachers(
                $version->submission->assignment->item->gradebook->offering_id,
            );
            $this->outbox->record(
                $teachers,
                'submission:'.$version->id,
                'A student submission is ready for review.',
            );
        }
    }
}
