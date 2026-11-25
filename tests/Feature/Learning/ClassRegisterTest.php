<?php

namespace Tests\Feature\Learning;

use App\Enums\Learning\AttendanceStatus;
use App\Models\Attendance;
use App\Models\AuditLog;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Page;

class ClassRegisterTest extends LearningTestCase
{
    public function test_bridge_resolves_only_one_registered_institutional_identity(): void
    {
        $class = $this->schedule('Mapped identities');
        $path = route('learning.provider', [$this->offering, $class], false);
        $key = str_repeat('k', 32);
        config(['learning.attendance_bridge_key' => $key]);
        $stamp = (string) now()->timestamp;
        $send = fn (array $data) => $this->postJson($path, $data, [
            'X-Learning-Timestamp' => $stamp,
            'X-Learning-Signature' => hash_hmac('sha256', implode("\n", [$stamp, 'POST', $path, json_encode($data)]), $key),
        ]);
        $student = ['external_student_id' => $this->learner->student->external_student_id];
        $lecturer = ['staff_number' => $this->teacher->lecturer->staff_number];
        $send($student)->assertNoContent();
        $send($student)->assertNoContent();
        $send($lecturer)->assertNoContent();
        $send($student + $lecturer)->assertUnprocessable();
        $send(['staff_number' => 'not-mapped'])->assertUnprocessable();
        $this->withdraw();
        $send($student)->assertUnprocessable();
        $this->assertDatabaseCount('attendance', 2);
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
        $signature = hash_hmac(
            'sha256',
            implode("\n", [$stamp, 'POST', $bridge, json_encode($participant)]),
            $key,
        );
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
        $this->post($url.'/marks', [...$participant, 'status' => 'unknown'])->assertSessionHasErrors(
            'status',
        );
        $this->post($url.'/marks', [...$participant, 'status' => 'absent'])->assertSessionHasErrors(
            'reason',
        );
        $this->post($url.'/marks', [
            ...$participant,
            'status' => 'absent',
            'reason' => 'Wrong participant',
        ])->assertSessionHasNoErrors();
        $this->postJson($bridge, $participant, $headers)->assertNoContent();
        $this->assertSame(AttendanceStatus::Absent, Attendance::sole()->status);
        $log = AuditLog::whereAction('attendance.recorded')->orderByDesc('id')->firstOrFail();
        $this->assertSame('Wrong participant', $log->details['reason']);
        $this->assertSame($this->teacher->id, $log->actor_id);
        $this->post($url.'/marks', [
            'user_id' => $this->teacher->id,
            'status' => 'present',
        ])->assertSessionHasNoErrors();
        $this->post($url.'/marks', [
            'user_id' => User::factory()->create()->id,
            'status' => 'present',
        ])->assertSessionHasErrors('user_id');
        $export = $this->get($url.'/register')->assertDownload();
        $this->assertStringContainsString(
            $this->learner->id.',absent,manual',
            $export->streamedContent(),
        );
        $this->actingAs($this->learner)
            ->get($url.'/register')
            ->assertForbidden();
        $this->postJson($bridge, $participant)->assertForbidden();
        $this->withdraw();
        $this->actingAs($this->teacher)
            ->post($url.'/marks', [...$participant, 'status' => 'present'])
            ->assertSessionHasErrors('user_id');
    }

    public function test_only_held_present_and_absent_marks_contribute_to_percentage(): void
    {
        foreach (['present', 'absent', 'excused', 'cancelled'] as $status) {
            $class = $this->schedule($status);
            $this->post(route('learning.marks', [$this->offering, $class]), [
                'user_id' => $this->learner->id,
                'status' => $status === 'cancelled' ? 'absent' : $status,
            ])->assertSessionHasNoErrors();
            if ($status === 'cancelled') {
                $class->forceFill(['status' => 'cancelled'])->save();
            }
        }

        $this->schedule('Unmarked');
        $this->actingAs($this->learner)
            ->get($this->base.'/classes')
            ->assertInertia(fn (Page $p) => $p->has('sessions', 5)->where('percentage', 50));
    }
}
