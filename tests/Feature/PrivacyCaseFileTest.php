<?php

namespace Tests\Feature;

use App\Enums\PrivacyCaseStage;
use App\Enums\RoleCode;
use App\Models\Enrolment;
use App\Models\PrivacyCaseFile;
use App\Models\Student;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Page;
use Tests\Support\OperationsAccess;
use Tests\TestCase;

class PrivacyCaseFileTest extends TestCase
{
    use OperationsAccess, RefreshDatabase;

    public function test_breach_response_requires_ordered_decisions_and_leaves_receipts(): void
    {
        $path = '/operations/privacy/cases';
        $input = ['kind' => 'breach', 'reference' => 'DRILL-01'];
        $this->operator(RoleCode::IctAdmin);
        $this->postJson($path, $input)->assertForbidden();
        $owner = $this->operator();
        $this->post($path, $input)->assertRedirect('/operations/privacy');
        $this->postJson($path, $input)->assertJsonValidationErrors('reference');
        $case = PrivacyCaseFile::sole();
        $this->assertSame($owner->id, $case->owner_id);
        $url = "$path/{$case->id}";
        $this->postJson($url, ['stage' => 'response_delivered', 'reference' => 'SKIP'])->assertConflict();
        foreach (['open', 'containment_recorded', 'notification_decision_recorded', 'notification_followup_recorded'] as $index => $stage) {
            $this->post($url, ['stage' => $stage, 'reference' => "RECEIPT-$index"])->assertRedirect();
        }

        $this->assertSame(PrivacyCaseStage::Closed, $case->fresh()->stage);
        $this->assertDatabaseHas('audit_logs', ['action' => 'privacy.case_advanced', 'subject_key' => $case->id]);
        $this->withoutVite()->get('/operations/privacy')->assertInertia(fn (Page $p) => $p
            ->where('cases.data.0.evidence', 'RECEIPT-3')->where('cases.data.0.stage', 'closed')->has('cases.links')
            ->has('cases.data.0.receipts', 5)->where('cases.data.0.receipts.0.actor', $owner->id)
            ->where('cases.data.0.receipts.4.reference', 'RECEIPT-3'));
    }

    public function test_subject_hold_blocks_an_existing_approval_until_separately_released(): void
    {
        $subject = User::factory()->create();
        $this->actingAs($subject)->postJson('/operations/consent', ['grant' => true, 'notice' => '1'])->assertOk();
        $this->postJson('/operations/consent', ['grant' => false, 'notice' => '1'])->assertOk();
        $this->travel(3)->days();
        $this->operator();
        $base = "/operations/privacy/{$subject->id}";
        $this->post('/operations/retention', ['days' => 1])->assertRedirect();
        $id = $this->postJson("$base/approvals", ['operation' => 'purge', 'reference' => 'DEL-1'])->assertCreated()->json('approval');
        $this->post('/operations/privacy/cases', ['kind' => 'retention_hold', 'reference' => 'HOLD-1', 'subject_id' => $subject->id])->assertRedirect();
        $release = '/operations/privacy/cases/'.PrivacyCaseFile::sole()->id;
        $decision = ['stage' => 'open', 'reference' => 'RELEASE-1'];
        $this->postJson($release, $decision)->assertForbidden();
        $this->operator();
        $this->postJson("$base/execute/$id", ['reference' => 'DEL-1'])->assertConflict();
        $this->assertDatabaseCount('privacy_consents', 1);
        $this->post($release, $decision)->assertRedirect();
        $this->postJson("$base/execute/$id", ['reference' => 'DEL-1'])->assertExactJson(['deleted' => 1]);
    }

    public function test_access_case_requires_subject_and_records_review_before_delivery(): void
    {
        $this->operator();
        $input = ['kind' => 'subject_access', 'reference' => 'ACCESS-1'];
        $this->postJson('/operations/privacy/cases', $input)->assertJsonValidationErrors('subject_id');
        $subject = User::factory()->create();
        $student = Student::factory()->create(['user_id' => $subject->id]);
        Enrolment::factory()->create(['student_id' => $student->id]);
        Enrolment::factory()->create();
        $base = "/operations/privacy/{$subject->id}";
        $scope = ['operation' => 'registration_extract', 'reference' => 'ACCESS-1'];
        $this->postJson("$base/approvals", $scope)->assertConflict();
        $this->post('/operations/privacy/cases', $input + ['subject_id' => $subject->id])->assertRedirect();
        $case = PrivacyCaseFile::sole();
        foreach (['open', 'identity_verified', 'extract_reviewed', 'response_delivered'] as $index => $stage) {
            $this->post("/operations/privacy/cases/{$case->id}", ['stage' => $stage, 'reference' => "ACCESS-E$index"])->assertRedirect();
            if ($index === 0) {
                $id = $this->postJson("$base/approvals", $scope)->assertCreated()->json('approval');
                $this->postJson("$base/execute/$id", ['reference' => 'ACCESS-1'])->assertForbidden();
                $this->operator();
                $this->postJson("$base/execute/$id", ['reference' => 'ACCESS-1'])->assertOk()->assertJsonCount(1, 'registrations')
                    ->assertJsonPath('registrations.0.external_student_id', $student->external_student_id)
                    ->assertJsonMissingPath('registrations.0.source_email');
            }
        }

        $this->assertSame(PrivacyCaseStage::Closed, $case->fresh()->stage);
    }
}
