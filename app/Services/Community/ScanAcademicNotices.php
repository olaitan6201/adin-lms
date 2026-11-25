<?php

namespace App\Services\Community;

use App\Models\Announcement;
use App\Models\MaterialVersion;
use App\Models\Offering;
use App\Models\User;
use App\Policies\LearningPolicy;

final class ScanAcademicNotices
{
    public function __construct(
        private CommunityAudience $audience,
        private NoticeOutbox $outbox,
        private LearningPolicy $releasePolicy,
        private ScanAssessmentNotices $assessments,
    ) {}

    public function run(): void
    {
        $this->courses();
        $this->materials();
        $this->assessments->run();
        $this->announcements();
    }

    public function courses(?string $id = null): void
    {
        foreach (Offering::where('status', 'published')->when($id, fn ($q) => $q->whereKey($id))->lazyById() as $offering) {
            $this->outbox->record(
                $this->audience->learners($offering->id),
                'course:'.$offering->id,
                'A course you are enrolled in has been published.',
            );
        }

    }

    public function announcements(?string $id = null): void
    {
        foreach (Announcement::where('published_at', '<=', now())->when($id, fn ($q) => $q->whereKey($id))->lazyById() as $notice) {
            $members = $notice->offering_id
                ? $this->audience->members($notice->offering_id)
                : User::where('status', 'active');
            $type = $notice->offering_id ? 'announcement' : 'admin';
            $this->outbox->record(
                $members,
                $type.':'.$notice->id,
                $notice->offering_id
                    ? 'A course announcement is available.'
                    : 'An institutional announcement is available.',
            );
        }
    }

    public function materials(?string $id = null): void
    {
        $versions = MaterialVersion::with('material.module')
            ->when($id, fn ($q) => $q->whereKey($id))
            ->where('created_at', '<=', now())
            ->whereHas('material.module.offering', fn ($q) => $q->where('status', 'published'));
        foreach ($versions->lazyById() as $version) {
            if (
                ! $this->releasePolicy->released($version->material) ||
                ! $this->releasePolicy->released($version->material->module)
            ) {
                continue;
            }

            $this->outbox->record(
                $this->audience->learners($version->material->module->offering_id),
                'material:'.$version->id,
                'A new version of course material is available.',
            );
        }
    }
}
