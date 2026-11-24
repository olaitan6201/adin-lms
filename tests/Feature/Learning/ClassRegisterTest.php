<?php

namespace Tests\Feature\Learning;

use App\Models\Attendance;
use App\Models\AuditLog;
use App\Models\ClassSession;
use App\Models\LearningMaterial;
use App\Models\Offering;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Page;

class ClassRegisterTest extends LearningTestCase
{
    private function schedule(string $title, string $status = 'held'): ClassSession
    {
        $this->actingAs($this->teacher)->post($this->base.'/classes', ['title' => $title, 'status' => $status, 'starts_at' => '2026-10-01T09:00:00+01:00',
            'ends_at' => '2026-10-01T11:00:00+01:00', 'meeting_url' => 'https://conference.example.test/private'])->assertSessionHasNoErrors()->assertRedirect();

        return ClassSession::whereTitle($title)->sole();
    }

    public function test_schedule_recording_and_join_link_are_scoped_even_on_direct_visits(): void
    {
        $session = $this->schedule('Laboratory', 'scheduled');
        $url = $this->base.'/classes/'.$session->id;
        $other = Offering::whereExternalOfferingId('DEMO-CSC102-2026-1')->sole();
        $data = ['title' => 'Lab II', 'status' => 'scheduled', 'starts_at' => '2026-10-03T08:00:00Z', 'ends_at' => '2026-10-03T10:00:00Z'];
        $this->post($url, [...$data, 'ends_at' => '2026-10-02'])->assertSessionHasErrors('ends_at');
        $this->post(route('learning.classes.save', [$other, $session]), $data)->assertNotFound();
        $material = fn ($offering) => LearningMaterial::whereHas('module', fn ($q) => $q->whereOfferingId($offering->id))->sole();
        $this->post($url, [...$data, 'recording_material_id' => $material($other)->id])->assertSessionHasErrors('recording_material_id');
        $this->post($url, [...$data, 'recording_material_id' => $material($this->offering)->id])->assertSessionHasNoErrors();
        $this->actingAs($this->learner)->get($this->base.'/classes')->assertInertia(fn (Page $p) => $p->where('sessions.0.title', 'Lab II')->where('sessions.0.recording_material_id', $material($this->offering)->id)->where('percentage', null)->has('participants', 0));
        $this->get(route('learning.classes', $other))->assertInertia(fn (Page $p) => $p->has('sessions', 0));
        $this->post($url, $data)->assertForbidden();
        $this->withdraw();
        $this->get($this->base.'/classes')->assertNotFound();
    }

    public function test_replayed_provider_checkins_preserve_manual_corrections_and_export_is_staff_only(): void
    {
        $class = $this->schedule('Tutorial');
        $url = $this->base.'/classes/'.$class->id;
        $participant = ['user_id' => $this->learner->id];
        $bridge = route('learning.provider', [$this->offering, $class], false);
        $key = str_repeat('x', 32);
        config(['learning.attendance_bridge_key' => $key]);
        $stamp = (string) now()->timestamp;
        $signature = hash_hmac('sha256', implode("\n", [$stamp, 'POST', $bridge, json_encode($participant)]), $key);
        $headers = ['X-Learning-Timestamp' => $stamp, 'X-Learning-Signature' => $signature];
        $this->postJson($bridge, $participant)->assertForbidden();
        $this->travel(6)->minutes();
        $this->postJson($bridge, $participant, $headers)->assertForbidden();
        $this->travelBack();
        $this->postJson($bridge.'?status=present', $participant, $headers)->assertForbidden();
        $this->postJson($bridge, ['user_id' => $this->teacher->id], $headers)->assertForbidden();
        $this->postJson($bridge, $participant, $headers)->assertNoContent();
        $this->postJson($bridge, $participant, $headers)->assertNoContent();
        $this->assertDatabaseCount('attendance', 1);
        $this->post($url.'/marks', [...$participant, 'status' => 'absent'])->assertSessionHasErrors('reason');
        $this->post($url.'/marks', [...$participant, 'status' => 'absent', 'reason' => 'Wrong participant'])->assertSessionHasNoErrors();
        $this->postJson($bridge, $participant, $headers)->assertNoContent();
        $this->assertSame('absent', Attendance::sole()->status);
        $log = AuditLog::whereAction('attendance.recorded')->orderByDesc('id')->firstOrFail();
        $this->assertSame('Wrong participant', $log->details['reason']);
        $this->assertSame($this->teacher->id, $log->actor_id);
        $this->post($url.'/marks', ['user_id' => $this->teacher->id, 'status' => 'present'])->assertSessionHasNoErrors();
        $this->post($url.'/marks', ['user_id' => User::factory()->create()->id, 'status' => 'present'])->assertSessionHasErrors('user_id');
        $export = $this->get($url.'/register')->assertDownload();
        $this->assertStringContainsString($this->learner->id.',absent,manual', $export->streamedContent());
        $this->actingAs($this->learner)->get($url.'/register')->assertForbidden();
        $this->postJson($bridge, $participant)->assertForbidden();
        $this->withdraw();
        $this->actingAs($this->teacher)->post($url.'/marks', [...$participant, 'status' => 'present'])->assertSessionHasErrors('user_id');
    }

    public function test_only_held_present_and_absent_marks_contribute_to_percentage(): void
    {
        foreach (['present', 'absent', 'excused', 'cancelled'] as $status) {
            $class = $this->schedule($status);
            $this->post(route('learning.marks', [$this->offering, $class]), ['user_id' => $this->learner->id, 'status' => $status === 'cancelled' ? 'absent' : $status])->assertSessionHasNoErrors();
            if ($status === 'cancelled') {
                $class->forceFill(['status' => 'cancelled'])->save();
            }
        }
        $this->schedule('Unmarked');
        $this->actingAs($this->learner)->get($this->base.'/classes')->assertInertia(fn (Page $p) => $p->has('sessions', 5)->where('percentage', 50));
    }
}
