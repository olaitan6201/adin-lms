<?php

namespace App\Providers;

use App\Models\Announcement;
use App\Models\AssessmentScore;
use App\Models\Assignment;
use App\Models\Examination;
use App\Models\MaterialVersion;
use App\Models\Offering;
use App\Models\SubmissionVersion;
use App\Services\Community\ScanAcademicNotices;
use App\Services\Community\ScanAssessmentNotices;
use Illuminate\Support\ServiceProvider;

final class CommunityEventServiceProvider extends ServiceProvider
{
    public function boot(ScanAcademicNotices $academic, ScanAssessmentNotices $assessments): void
    {
        Offering::saved(function (Offering $course) use ($academic): void {
            if ($course->wasChanged('status') || $course->wasRecentlyCreated) {
                $academic->courses($course->id);
            }
        });
        MaterialVersion::created(fn ($version) => $academic->materials($version->id));
        Announcement::created(fn ($notice) => $academic->announcements($notice->id));
        Assignment::created(fn ($assignment) => $assessments->assignments($assignment->id));
        Examination::saved(fn ($exam) => $assessments->examinations($exam->id));
        SubmissionVersion::created(fn ($version) => $assessments->submissions($version->id));
        AssessmentScore::saved(fn ($score) => $assessments->releasedResults($score->id));
    }
}
