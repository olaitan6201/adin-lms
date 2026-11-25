<?php

namespace Tests\Feature\Learning;

use App\Enums\RoleCode;
use Tests\Support\OperationsAccess;

class BridgeRotationTest extends LearningTestCase
{
    use OperationsAccess;

    public function test_ict_can_rotate_and_disable_the_attendance_adapter_without_disclosing_keys(): void
    {
        $session = $this->schedule('Bridge rotation');
        $url = route('learning.provider', [$this->offering, $session], false);
        $primary = str_repeat('a', 32);
        $standby = str_repeat('b', 32);
        config(['learning.attendance_bridge_key' => $primary, 'learning.attendance_bridge_standby_key' => $standby]);
        $this->operator(RoleCode::IctAdmin);
        $settings = ['storage_mib' => 25, 'probe_ms' => 200];
        $body = ['user_id' => $this->learner->id];
        $stamp = (string) now()->timestamp;
        $headers = fn (string $key): array => [
            'X-Learning-Timestamp' => $stamp,
            'X-Learning-Signature' => hash_hmac('sha256', implode("\n", [$stamp, 'POST', $url, json_encode($body)]), $key),
        ];
        $this->post('/operations/infrastructure', $settings + ['bridge_slot' => 'standby'])->assertRedirect('/operations');
        $this->postJson($url, $body, $headers($primary))->assertForbidden();
        $this->postJson($url, $body, $headers($standby))->assertNoContent();
        $this->post('/operations/infrastructure', $settings + ['bridge_slot' => 'disabled'])->assertRedirect('/operations');
        $this->postJson($url, $body, $headers($standby))->assertForbidden();
    }
}
