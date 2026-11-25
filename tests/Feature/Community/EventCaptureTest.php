<?php

namespace Tests\Feature\Community;

use App\Enums\OfferingStatus;
use App\Models\LearningMaterial;
use App\Models\MaterialVersion;
use App\Models\Module;
use App\Models\Notification;
use App\Services\Community\ScanAcademicNotices;
use Illuminate\Support\Facades\DB;

final class EventCaptureTest extends CommunityTestCase
{
    public function test_delayed_material_release_cannot_reuse_an_old_rule_after_prerequisite_edits(): void
    {
        $course = $this->course();
        $prior = Module::where('offering_id', $course->id)->sole();
        $lesson = Module::factory()->create(['offering_id' => $course->id, 'position' => 2]);
        $opens = now()->addHour();
        $resource = LearningMaterial::factory()->create([
            'module_id' => $lesson->id, 'opens_at' => $opens, 'closes_at' => $opens->copy()->addHour(),
        ]);
        $version = MaterialVersion::factory()->create(['material_id' => $resource->id]);
        $lesson->forceFill(['prerequisite_id' => $prior->id])->save();
        $this->travel(3)->hours();
        $lesson->forceFill(['prerequisite_id' => null])->save();

        $this->artisan('community:notify')->assertSuccessful();
        $this->assertDatabaseMissing('notifications', ['event_key' => 'material:'.$version->id]);
    }

    public function test_prerequisite_edit_before_release_queues_the_replacement_rule(): void
    {
        $course = $this->course();
        $prior = Module::where('offering_id', $course->id)->sole();
        $lesson = Module::factory()->create([
            'offering_id' => $course->id, 'position' => 2, 'prerequisite_id' => $prior->id,
        ]);
        $resource = LearningMaterial::factory()->create([
            'module_id' => $lesson->id, 'opens_at' => now()->addHour(), 'closes_at' => now()->addHours(2),
        ]);
        $version = MaterialVersion::factory()->create(['material_id' => $resource->id]);
        $lesson->forceFill(['prerequisite_id' => null])->save();
        $this->travel(3)->hours();

        $this->artisan('community:notify')->assertSuccessful();
        $notices = Notification::where('event_key', 'material:'.$version->id);
        $this->assertSame(2, $notices->count());
        $this->assertSame(2, DB::table('notification_deliveries')->whereIn('notification_id', $notices->select('id'))->count());
    }

    public function test_delayed_material_notice_requires_completion_by_the_release_instant(): void
    {
        $course = $this->course();
        $prior = Module::factory()->create(['offering_id' => $course->id, 'position' => 2]);
        $lesson = Module::factory()->create([
            'offering_id' => $course->id, 'position' => 3, 'prerequisite_id' => $prior->id,
        ]);
        $opens = now()->addHour()->startOfSecond();
        $resource = LearningMaterial::factory()->create([
            'module_id' => $lesson->id, 'opens_at' => $opens, 'closes_at' => $opens->copy()->addHour(),
        ]);
        $version = MaterialVersion::factory()->create(['material_id' => $resource->id]);
        $eligible = $this->person('ada');
        $late = $this->person('tunde');
        $complete = route('learning.complete', [$course, $prior]);
        $this->travelTo($opens);
        $this->actingAs($eligible)->post($complete)->assertRedirect();
        $this->travel(2)->hours();
        $this->actingAs($late)->post($complete)->assertRedirect();
        $this->artisan('community:notify')->assertSuccessful();

        $notices = Notification::where('event_key', 'material:'.$version->id);
        $this->assertSame([$eligible->id], $notices->pluck('recipient_id')->all());
        $this->assertSame(['email'], DB::table('notification_deliveries')
            ->whereIn('notification_id', $notices->select('id'))->pluck('channel')->all());
    }

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

    public function test_missed_material_window_replays_only_if_its_release_was_not_cancelled(): void
    {
        $module = Module::where('offering_id', $this->course()->id)->sole();
        $create = function () use ($module): MaterialVersion {
            $resource = LearningMaterial::factory()->create([
                'module_id' => $module->id, 'opens_at' => now()->addHour(), 'closes_at' => now()->addHours(2),
            ]);

            return MaterialVersion::factory()->create(['material_id' => $resource->id]);
        };
        DB::beginTransaction();
        $create();
        $this->assertDatabaseHas('jobs', ['queue' => 'academic-releases']);
        DB::rollBack();
        $this->assertDatabaseMissing('jobs', ['queue' => 'academic-releases']);
        $released = $create();
        $cancelled = $create();
        $cancelled->material->forceFill(['restrictions' => ['hidden' => true]])->save();
        $this->assertDatabaseMissing('notifications', ['event_key' => 'material:'.$released->id]);
        $this->travel(3)->hours();
        $this->artisan('community:notify')->assertSuccessful();
        $this->assertSame(2, Notification::where('event_key', 'material:'.$released->id)->count());
        $this->assertDatabaseMissing('notifications', ['event_key' => 'material:'.$cancelled->id]);
    }
}
