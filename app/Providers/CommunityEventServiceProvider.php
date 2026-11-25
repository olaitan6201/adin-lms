<?php

namespace App\Providers;

use App\Enums\OfferingStatus;
use App\Models\Announcement;
use App\Models\AssessmentScore;
use App\Models\Assignment;
use App\Models\Examination;
use App\Models\MaterialVersion;
use App\Models\Module;
use App\Models\Offering;
use App\Models\SubmissionVersion;
use App\Services\Community\ScanAcademicNotices;
use App\Services\Community\ScanAssessmentNotices;
use App\Services\Community\TimedReleaseCapture;
use Illuminate\Support\ServiceProvider;

final class CommunityEventServiceProvider extends ServiceProvider
{
    public function boot(ScanAcademicNotices $academic, ScanAssessmentNotices $assessments, TimedReleaseCapture $timed): void
    {
        Offering::saved(function (Offering $course) use ($academic, $timed, $assessments): void {
            if ($course->wasChanged('status') || $course->wasRecentlyCreated) {
                $academic->courses($course->id);
                if ($course->status === OfferingStatus::Published) {
                    $academic->materials(offering: $course->id);
                    $timed->reschedule($course->id);
                    foreach (Examination::whereHas('item.gradebook', fn ($q) => $q->where('offering_id', $course->id))->lazyById() as $exam) {
                        $assessments->examinations($exam->id);
                    }

                    foreach (Assignment::whereHas('item.gradebook', fn ($q) => $q->where('offering_id', $course->id))->lazyById() as $work) {
                        $assessments->assignments($work->id);
                        $timed->assignment($work);
                    }
                }
            }
        });
        Module::updated(function (Module $module) use ($academic, $timed): void {
            if ($module->wasChanged(['kind', 'opens_at', 'closes_at'])) {
                $academic->materials(module: $module->id);
                $timed->reschedule($module->offering_id, $module->id);
            }
        });
        MaterialVersion::created(function (MaterialVersion $version) use ($academic, $timed): void {
            $academic->materials($version->id);
            $timed->material($version->fresh());
        });
        Announcement::created(fn ($notice) => $academic->announcements($notice->id));
        Assignment::created(function (Assignment $work) use ($assessments, $timed): void {
            $assessments->assignments($work->id);
            $timed->assignment($work->fresh());
        });
        Examination::saved(fn ($exam) => $assessments->examinations($exam->id));
        SubmissionVersion::created(fn ($version) => $assessments->submissions($version->id));
        AssessmentScore::saved(fn ($score) => $assessments->releasedResults($score->id));
    }
}
