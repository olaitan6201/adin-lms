<?php

namespace Tests\Feature;

use App\Enums\RoleCode;
use App\Models\AuditLog;
use App\Models\File;
use App\Models\SystemConfiguration;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Page;
use Tests\Support\OperationsAccess;
use Tests\TestCase;

class InfrastructureDeskTest extends TestCase
{
    use OperationsAccess, RefreshDatabase;

    public function test_runner_outcomes_are_separate_from_operator_reports_and_fail_closed(): void
    {
        $this->operator(RoleCode::IctAdmin);
        $this->withoutVite();
        $file = tempnam(sys_get_temp_dir(), 's18-backup-');
        try {
            config(['operations.backup_status_file' => $file, 'operations.backup_max_age_hours' => 1]);
            file_put_contents($file, '{"state":"snapshot","run":"invalid private payload"}');
            $this->get('/operations')->assertInertia(fn (Page $p) => $p->where('infrastructure.backup', ['state' => 'unavailable']));
            foreach (['failed', 'snapshot'] as $state) {
                file_put_contents($file, json_encode(['state' => $state, 'run' => 'job-101', 'finished_at' => now()->subHours(2)->timestamp]));
                $this->get('/operations')->assertInertia(fn (Page $p) => $p->where('infrastructure.backup.state', $state)
                    ->where('infrastructure.backup.overdue', true)->where('infrastructure.backup.run', 'job-101')
                    ->where('infrastructure.receipts', []));
            }
        } finally {
            unlink($file);
        }
    }

    public function test_controls_are_restricted_and_only_provisioned_references_are_saved(): void
    {
        $settings = ['storage_mib' => 1, 'probe_ms' => 100, 'bridge_slot' => 'standby'];
        $this->operator(RoleCode::Student);
        $this->postJson('/operations/infrastructure', $settings)->assertForbidden();
        $this->postJson('/operations/backup-evidence', [])->assertForbidden();
        $this->operator(RoleCode::IctAdmin);
        $this->postJson('/operations/infrastructure', $settings)->assertUnprocessable();
        config(['learning.attendance_bridge_standby_key' => $secret = str_repeat('X', 32)]);
        $this->postJson('/operations/infrastructure', ['bridge_slot' => $secret] + $settings)->assertUnprocessable();
        $this->post('/operations/infrastructure', $settings + ['key' => $secret])->assertSessionHasErrors('bridge_slot');
        $this->assertStringNotContainsString($secret, serialize(session()->getOldInput()));
        $this->assertDatabaseMissing('audit_logs', ['action' => 'operations.infrastructure_changed']);
        $this->post('/operations/infrastructure', $settings)->assertRedirect('/operations');
        $this->assertEquals($settings, SystemConfiguration::sole()->value);
        $this->assertEquals($settings, AuditLog::whereAction('operations.infrastructure_changed')->sole()->details);
        $this->withoutVite()->get('/operations')->assertDontSee($secret);
    }

    public function test_monitor_counts_file_metadata_and_shows_backup_evidence_without_job_payloads(): void
    {
        $this->operator(RoleCode::IctAdmin);
        config(['queue.default' => 'database']);
        File::forceCreate(['object_key' => 'hidden-name', 'filename' => 'hidden-name', 'media_type' => 'text/plain',
            'size_bytes' => 4194304, 'checksum' => str_repeat('0', 64), 'validation_status' => 'clean']);
        $this->post('/operations/backup-evidence', ['reference' => 'DRILL-400', 'outcome' => 'restored'])->assertRedirect();
        $this->withoutVite()->get('/operations')->assertDontSee('hidden-name')->assertInertia(fn (Page $p) => $p
            ->where('infrastructure.bytes', 4194304)->where('infrastructure.jobs', 0)->where('infrastructure.failed', 0)
            ->where('infrastructure.receipts.0.reference', 'DRILL-400')->where('infrastructure.receipts.0.outcome', 'restored'));
    }
}
