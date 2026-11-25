<?php

namespace Tests\Feature;

use App\Models\PrivacyCaseFile;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Support\OperationsAccess;
use Tests\TestCase;

final class RecordsDispositionTest extends TestCase
{
    use OperationsAccess, RefreshDatabase;

    public function test_custodian_disposition_requires_schedule_independent_authority_hold_recheck_and_verified_execution(): void
    {
        $subject = User::factory()->create();
        $this->operator();
        $base = '/operations/privacy/cases';
        $open = ['subject_id' => $subject->id, 'reference' => 'SYNTHETIC-CASE', 'kind' => 'records_disposition'];
        $this->post($base, $open)->assertRedirect();
        $case = PrivacyCaseFile::sole();
        $url = "$base/{$case->id}";
        $this->post($url, ['stage' => 'open', 'reference' => 'SCHEDULE-INVENTORY-1'])->assertRedirect();
        $decision = ['stage' => 'schedule_and_inventory_reviewed', 'reference' => 'AUTHORISATION-2'];
        $this->postJson($url, $decision)->assertForbidden();
        $this->operator();
        $this->post($url, $decision)->assertRedirect();
        $this->post($base, ['reference' => 'TEST-HOLD', 'kind' => 'retention_hold'] + $open)->assertRedirect();
        $execution = ['stage' => 'custodian_disposition_authorised', 'reference' => 'CUSTODIAN-RECEIPT-3'];
        $this->postJson($url, $execution)->assertConflict();
        $this->operator();
        $hold = PrivacyCaseFile::whereReference('TEST-HOLD')->sole();
        $this->post("$base/{$hold->id}", ['stage' => 'open', 'reference' => 'RELEASE-4'])->assertRedirect();
        $this->post($url, $execution)->assertRedirect();
        $check = ['stage' => 'custodian_execution_recorded', 'reference' => 'VERIFIED-5'];
        $this->postJson($url, $check)->assertForbidden();
        $this->operator();
        $this->post($url, $check)->assertRedirect();
        $this->post($url, ['stage' => 'disposition_verified', 'reference' => 'CLOSE-6'])->assertRedirect();
        $this->assertSame('closed', $case->fresh()->stage->value);
        $this->assertSame(6, $case->receipts()->count());
        $this->assertDatabaseHas('users', ['id' => $subject->id]);
    }
}
