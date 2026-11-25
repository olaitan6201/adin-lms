<?php

namespace Tests\Feature\Community;

use App\Enums\CommunityAuditAction;
use App\Models\AuditLog;
use App\Models\LearningMaterial;
use App\Models\MaterialVersion;
use App\Models\Module;
use App\Models\Notification;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\DB;

final class LegacyNoticeRuleTest extends CommunityTestCase
{
    public function test_legacy_job_retries_with_verified_history_without_widening_the_audience(): void
    {
        $course = $this->course();
        $prior = Module::whereOfferingId($course->id)->sole();
        $lesson = Module::factory()->create([
            'offering_id' => $course->id, 'position' => 2, 'prerequisite_id' => $prior->id,
        ]);
        $resource = LearningMaterial::factory()->create([
            'module_id' => $lesson->id, 'opens_at' => now()->addHour(), 'closes_at' => now()->addHours(2),
        ]);
        $version = MaterialVersion::factory()->create(['material_id' => $resource->id]);
        $ada = $this->person('ada');
        $this->actingAs($ada)->post(route('learning.complete', [$course, $prior]))->assertRedirect();
        $this->travel(3)->hours();
        $lesson->forceFill(['prerequisite_id' => null])->saveQuietly();
        $legacy = AuditLog::forceCreate([
            'action' => CommunityAuditAction::LessonPrerequisiteChanged->value, 'subject_key' => $lesson->id, 'occurred_at' => now(),
        ]);
        $notices = Notification::where('event_key', 'material:'.$version->id);
        $this->artisan('community:notify')->assertSuccessful();
        $this->assertSame(0, $notices->count());
        $this->assertDatabaseHas('jobs', ['queue' => 'academic-releases', 'attempts' => 1]);

        $args = ['change' => $legacy->id, 'previous' => $prior->id, 'microsecond' => '0', 'evidence' => 'fixture-snapshot'];
        $this->artisan('community:reconcile-rule', ['previous' => $lesson->id] + $args)->assertFailed();
        $this->artisan('community:reconcile-rule', $args)->assertSuccessful();
        $this->artisan('community:reconcile-rule', $args)->assertFailed();
        $retry = DB::table('jobs')->where('queue', 'academic-releases')->sole();
        $this->travelTo(CarbonImmutable::createFromTimestampUTC($retry->available_at + 1));
        $this->artisan('community:notify')->assertSuccessful();
        $this->assertSame([$ada->id], $notices->pluck('recipient_id')->all());
        $this->assertSame(['email'], DB::table('notification_deliveries')->whereIn('notification_id', $notices->select('id'))->pluck('channel')->all());
    }
}
