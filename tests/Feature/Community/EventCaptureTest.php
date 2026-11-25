<?php

namespace Tests\Feature\Community;

use App\Enums\OfferingStatus;
use App\Models\Notification;
use App\Services\Community\ScanAcademicNotices;
use Illuminate\Support\Facades\DB;

final class EventCaptureTest extends CommunityTestCase
{
    public function test_publication_survives_unpublishing_between_scans_but_not_rollback(): void
    {
        $course = $this->course();
        $course->forceFill(['status' => OfferingStatus::Unpublished])->saveQuietly();
        $events = Notification::where('event_key', 'course:'.$course->id);
        DB::beginTransaction();
        $course->forceFill(['status' => OfferingStatus::Published])->save();
        $this->assertSame(2, $events->count());
        DB::rollBack();
        $this->assertSame(0, $events->count());
        $course->refresh()->forceFill(['status' => OfferingStatus::Published])->save();
        $course->forceFill(['status' => OfferingStatus::Unpublished])->save();
        app(ScanAcademicNotices::class)->run();
        $this->assertSame(2, $events->count());
        $this->assertSame(2, DB::table('notification_deliveries')->whereIn('notification_id', $events->select('id'))->count());
    }
}
