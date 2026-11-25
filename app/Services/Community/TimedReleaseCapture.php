<?php

namespace App\Services\Community;

use App\Enums\Learning\LessonKind;
use App\Enums\OfferingStatus;
use App\Enums\TimedNotice;
use App\Jobs\ReleaseScheduledNotice;
use App\Models\Assignment;
use App\Models\MaterialVersion;
use App\Models\Offering;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\Queue;

final class TimedReleaseCapture
{
    public function __construct(private CommunityAudience $audience, private NoticeOutbox $outbox) {}

    public function assignment(Assignment $work): void
    {
        $course = $work->item->gradebook->offering;
        $this->schedule($course, TimedNotice::Assignment, $work->id, $work->opens_at);
        $this->schedule($course, TimedNotice::Deadline, $work->id, max($work->opens_at, $work->due_at->subDay()));
    }

    public function material(MaterialVersion $version): void
    {
        $resource = $version->material;
        $module = $resource->module;
        $opens = max($module->opens_at, $resource->opens_at, $version->created_at);
        if (! $resource->restrictions && ! str_starts_with($module->kind, LessonKind::DRAFT_PREFIX)) {
            $this->schedule($module->offering, TimedNotice::Material, $version->id, $opens);
        }
    }

    public function reschedule(string $offering, ?string $module = null): void
    {
        $versions = MaterialVersion::with('material.module.offering')
            ->whereHas('material.module', fn ($q) => $q->where('offering_id', $offering)->when($module, fn ($m) => $m->whereKey($module)));
        foreach ($versions->lazyById() as $version) {
            $this->material($version);
        }
    }

    private function schedule(Offering $course, TimedNotice $kind, string $id, CarbonImmutable $at): void
    {
        if (! $at->isFuture() || $course->status !== OfferingStatus::Published) {
            return;
        }

        Queue::connection('community_events')->later($at, new ReleaseScheduledNotice(
            $course->id, $kind, $id, $at->timestamp,
        ));
    }

    public function release(ReleaseScheduledNotice $event): void
    {
        $at = CarbonImmutable::createFromTimestampUTC($event->at);
        $course = Offering::find($event->course);
        if ($at->isFuture() || $course?->status !== OfferingStatus::Published || $course->approved_at?->gt($at)) {
            return;
        }

        $key = "{$event->kind->value}:{$event->source}";
        if ($event->kind === TimedNotice::Material) {
            $resource = MaterialVersion::find($event->source)?->material;
            $module = $resource?->module;
            if ($module?->offering_id !== $course->id || $resource->restrictions || str_starts_with($module->kind, LessonKind::DRAFT_PREFIX)) {
                return;
            }

            foreach ([$module, $resource] as $item) {
                if ($item->opens_at?->gt($at) || $item->closes_at?->lte($at)) {
                    return;
                }
            }

            $body = 'A new version of course material was released.';
            $recipients = $this->audience->materialLearners($module, $at);
        } else {
            $work = Assignment::find($event->source);
            if ($work?->item->gradebook->offering_id !== $course->id || $work->opens_at->gt($at) || $work->closes_at->lte($at)) {
                return;
            }

            $body = 'A course assignment was released.';
            if ($event->kind === TimedNotice::Deadline) {
                if (! $at->equalTo(max($work->opens_at, $work->due_at->subDay()))) {
                    return;
                }

                $key .= ':'.$work->due_at->timestamp;
                $body = $work->due_at->isPast() ? 'A course assignment deadline has passed.' : 'A course assignment is due within 24 hours.';
            }
        }

        $this->outbox->record($recipients ?? $this->audience->learners($course->id, registeredBy: $at), $key, $body);
    }
}
