<?php

namespace App\Services\Community;

use App\Models\Announcement;
use App\Models\AssessmentScore;
use App\Models\Assignment;
use App\Models\Examination;
use App\Models\MaterialVersion;
use App\Models\Offering;
use App\Models\SubmissionVersion;
use App\Models\User;
use App\Policies\LearningPolicy;

final class ScanAcademicNotices
{
    public function __construct(private CommunityAudience $audience, private NoticeOutbox $outbox, private LearningPolicy $releasePolicy) {}

    public function run(): void
    {
        foreach (Offering::where('status', 'published')->lazyById() as $offering) {
            $this->outbox->record($this->audience->learners($offering->id), 'course:'.$offering->id, 'A course you are enrolled in has been published.');
        }
        $this->materials();
        $this->assessments();
        $this->resultsAndSubmissions();
        foreach (Announcement::where('published_at', '<=', now())->lazyById() as $notice) {
            $members = $notice->offering_id ? $this->audience->members($notice->offering_id) : User::where('status', 'active');
            $type = $notice->offering_id ? 'announcement' : 'admin';
            $this->outbox->record($members, $type.':'.$notice->id, $notice->offering_id ? 'A course announcement is available.' : 'An institutional announcement is available.');
        }
    }

    private function materials(): void
    {
        $versions = MaterialVersion::with('material.module')->where('created_at', '<=', now())
            ->whereHas('material.module.offering', fn ($q) => $q->where('status', 'published'));
        foreach ($versions->lazyById() as $version) {
            if (! $this->releasePolicy->released($version->material) || ! $this->releasePolicy->released($version->material->module)) {
                continue;
            }
            $this->outbox->record($this->audience->learners($version->material->module->offering_id), 'material:'.$version->id, 'A new version of course material is available.');
        }
    }

    private function assessments(): void
    {
        $published = fn ($q) => $q->where('status', 'published');
        $assignments = Assignment::with('item.gradebook')->whereHas('item.gradebook.offering', $published)
            ->where('opens_at', '<=', now())->where('closes_at', '>', now());
        foreach ($assignments->lazyById() as $assignment) {
            $learners = $this->audience->learners($assignment->item->gradebook->offering_id);
            $this->outbox->record(clone $learners, 'assignment:'.$assignment->id, 'A course assignment is available.');
            if ($assignment->due_at->isFuture() && $assignment->due_at->lte(now()->addDay())) {
                $this->outbox->record($learners, 'deadline:'.$assignment->id.':'.$assignment->due_at->timestamp, 'A course assignment is due within 24 hours.');
            }
        }
        foreach (Examination::with('item.gradebook')->whereHas('item.gradebook.offering', $published)->where('closes_at', '>', now())->lazyById() as $exam) {
            $this->outbox->record($this->audience->learners($exam->item->gradebook->offering_id), 'exam:'.$exam->id.':'.$exam->opens_at->timestamp, 'An examination has been scheduled.');
        }
    }

    private function resultsAndSubmissions(): void
    {
        $scores = AssessmentScore::with(['item.gradebook', 'enrolment.student'])->where('released_at', '<=', now())
            ->whereIn('item_id', Examination::select('item_id'))->whereHas('item.gradebook.offering', fn ($q) => $q->where('status', 'published'));
        foreach ($scores->lazyById() as $score) {
            if ($score->enrolment->offering_id === $score->item->gradebook->offering_id) {
                $learners = $this->audience->learners($score->enrolment->offering_id)->whereKey($score->enrolment->student->user_id);
                $this->outbox->record($learners, 'result:'.$score->id, 'An examination result has been released to you.');
            }
        }
        foreach (SubmissionVersion::with('submission.assignment.item.gradebook')->where('submitted_at', '<=', now())->lazyById() as $version) {
            $teachers = $this->audience->teachers($version->submission->assignment->item->gradebook->offering_id);
            $this->outbox->record($teachers, 'submission:'.$version->id, 'A student submission is ready for review.');
        }
    }
}
