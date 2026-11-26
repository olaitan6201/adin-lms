<?php

namespace Tests\Feature;

use App\Models\AuditLog;
use App\Models\PrivacyConsent;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia;
use Tests\Support\OperationsAccess;
use Tests\TestCase;

class OperationsPrivacyTest extends TestCase
{
    use OperationsAccess, RefreshDatabase;

    public function test_consent_can_be_withdrawn_and_only_expired_records_of_the_approved_subject_can_be_purged(): void
    {
        $this->withoutVite();
        $subject = User::factory()->create();
        $other = User::factory()->create();
        foreach ([$subject, $other] as $user) {
            $this->actingAs($user)->postJson('/operations/consent', ['grant' => true, 'notice' => '1'])->assertOk();
            $this->postJson('/operations/consent', ['grant' => false, 'notice' => '1'])->assertOk();
        }

        $this->get('/operations')->assertForbidden();
        $this->postJson('/operations/retention', ['days' => 1])->assertForbidden();
        $this->travel(3)->days();
        $this->actingAs($subject)->postJson('/operations/consent', ['grant' => true, 'notice' => '1'])->assertOk();
        $this->operator();
        $this->get('/operations')->assertInertia(fn (AssertableInertia $page) => $page->component('Operations/Index')->where('retentionDays', null));
        $this->postJson('/operations/retention', ['days' => 0])->assertUnprocessable();
        $this->post('/operations/retention', ['days' => 2])->assertRedirect('/operations');
        $base = "/operations/privacy/{$subject->id}";
        $id = $this->postJson("$base/approvals", ['operation' => 'purge', 'reference' => 'CASE-01'])->assertCreated()->json('approval');
        $this->postJson("$base/execute/$id", ['reference' => 'CASE-01'])->assertForbidden();
        $this->operator();
        $this->postJson("/operations/privacy/{$other->id}/execute/$id", ['reference' => 'CASE-01'])->assertNotFound();
        $this->postJson("$base/execute/$id", ['reference' => 'CASE-OTHER'])->assertUnprocessable()->assertJsonValidationErrors('reference');
        $this->assertSame(1, PrivacyConsent::where('user_id', $subject->id)->whereNotNull('withdrawn_at')->count());
        $this->assertDatabaseMissing('audit_logs', ['action' => 'privacy.executed', 'subject_key' => $id]);
        $this->postJson("$base/execute/$id", ['reference' => 'CASE-01'])->assertExactJson(['deleted' => 1]);
        $this->postJson("$base/execute/$id", ['reference' => 'CASE-01'])->assertConflict();
        $this->assertSame(1, PrivacyConsent::where('user_id', $subject->id)->whereNull('withdrawn_at')->count());
        $this->assertSame(1, PrivacyConsent::where('user_id', $other->id)->count());
        $this->assertDatabaseHas('audit_logs', ['action' => 'privacy.executed', 'subject_key' => $id]);
    }

    public function test_export_is_subject_only_and_excludes_credentials_even_if_requested(): void
    {
        $subject = User::factory()->create();
        $base = "/operations/privacy/{$subject->id}";
        $this->actingAs($subject)->postJson("$base/approvals", ['operation' => 'export'])->assertForbidden();
        $this->operator();
        $id = $this->postJson("$base/approvals", ['operation' => 'export', 'reference' => 'CASE-02'])->assertCreated()->json('approval');
        $this->operator();
        $this->postJson("$base/execute/$id")->assertUnprocessable()->assertJsonValidationErrors('reference');
        $this->postJson("$base/execute/$id", ['reference' => 'case-02'])->assertUnprocessable()->assertJsonMissingPath('account');
        $this->assertDatabaseMissing('audit_logs', ['action' => 'privacy.executed', 'subject_key' => $id]);
        $this->postJson("$base/execute/$id", ['reference' => 'CASE-02', 'include' => 'credentials', 'operation' => 'purge'])->assertOk()
            ->assertExactJson(['account' => $subject->fresh()->only(['id', 'full_name', 'email', 'status']), 'consents' => []]);
    }

    public function test_incident_referral_records_the_case_reference(): void
    {
        $operator = $this->operator();
        $this->postJson('/operations/privacy/incidents', ['reference' => 'DRILL-02'])->assertCreated();

        $this->assertDatabaseHas('audit_logs', [
            'actor_id' => $operator->id,
            'action' => 'privacy.incident_referred',
            'subject_key' => 'DRILL-02',
        ]);
    }

    public function test_unknown_stored_operation_cannot_delete_eligible_consent(): void
    {
        $subject = User::factory()->create();
        $this->actingAs($subject)->postJson('/operations/consent', ['grant' => true, 'notice' => '1'])->assertOk();
        $this->postJson('/operations/consent', ['grant' => false, 'notice' => '1'])->assertOk();
        $this->travel(2)->days();

        $approver = $this->operator();
        $this->post('/operations/retention', ['days' => 1])->assertRedirect();
        $legacy = AuditLog::forceCreate([
            'actor_id' => $approver->id,
            'action' => 'privacy.approved',
            'subject_key' => $subject->id,
            'occurred_at' => now(),
            'details' => ['operation' => 'retired-operation', 'reference' => 'CASE-LEGACY', 'days' => 1],
        ]);

        $this->operator();
        $this->postJson("/operations/privacy/{$subject->id}/execute/{$legacy->id}", ['reference' => 'CASE-LEGACY'])->assertConflict();
        $this->assertDatabaseHas('privacy_consents', ['user_id' => $subject->id]);
        $this->assertDatabaseMissing('audit_logs', ['action' => 'privacy.executed', 'subject_key' => $legacy->id]);
    }

    public function test_purge_requires_current_approved_policy_and_export_approval_expires(): void
    {
        $subject = User::factory()->create();
        $base = "/operations/privacy/{$subject->id}";
        $this->operator();
        $approval = ['operation' => 'purge', 'reference' => 'CASE-03'];
        $this->postJson("$base/approvals", $approval)->assertConflict();
        $this->post('/operations/retention', ['days' => 30])->assertRedirect();
        $id = $this->postJson("$base/approvals", $approval)->assertCreated()->json('approval');
        $export = $this->postJson("$base/approvals", ['operation' => 'export', 'reference' => 'CASE-04'])->assertCreated()->json('approval');
        $this->operator();
        $this->post('/operations/retention', ['days' => 1])->assertRedirect();
        $this->postJson("$base/execute/$id", ['reference' => 'CASE-03'])->assertConflict();
        $this->travel(25)->hours();
        $this->postJson("$base/execute/$export", ['reference' => 'CASE-04'])->assertConflict();
        $this->assertDatabaseMissing('audit_logs', ['action' => 'privacy.executed']);
    }
}
