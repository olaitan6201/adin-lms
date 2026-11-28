<?php

namespace Tests\Feature;

use App\Models\CurriculumAdoption;
use App\Models\Student;
use App\Models\User;
use App\Services\Academics\OfficialPlacementRegister;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use PHPUnit\Framework\Attributes\TestWith;
use Tests\Support\AcademicAccess;
use Tests\Support\BuildsPlacementScenario;
use Tests\TestCase;

final class PlacementPrivacyTest extends TestCase
{
    use AcademicAccess, BuildsPlacementScenario, RefreshDatabase;

    public function test_sensitive_desk_responses_are_private_and_keep_detail_out_of_queue_rows(): void
    {
        $registrar = $this->academicUser('registrar');
        $student = Student::factory()->create(['external_student_id' => 'PRIVATE-STUDENT-01']);
        $pin = CurriculumAdoption::factory()->create()->activeDecision;
        $register = app(OfficialPlacementRegister::class);
        $update = $register->queue($registrar, $this->placementRow($student, $pin));
        $register->accept($registrar, $update, 'Private approval note');

        $queue = $this->get(route('admin.placements.index'))->assertOk();
        $this->assertPrivateNoStore($queue->headers->all('Cache-Control'));
        $this->assertSame($update->id, $queue->inertiaProps('updates.0.id'));
        $queue->assertDontSee('PRIVATE-STUDENT-01')->assertDontSee('Private approval note');
        $keys = array_keys($queue->inertiaProps('updates.0'));
        sort($keys);
        $this->assertSame(['accepted', 'id', 'nextNumber', 'number', 'registration', 'url'], $keys);

        $detail = $this->get(route('admin.placements.index', $update))->assertOk();
        $this->assertPrivateNoStore($detail->headers->all('Cache-Control'));
        $this->assertSame('PRIVATE-STUDENT-01', $detail->inertiaProps('selected.student'));
        $this->assertSame('Private approval note', $detail->inertiaProps('selected.approvalNote'));
        $this->assertSame(true, $detail->inertiaPage()['encryptHistory'] ?? false);
        $this->assertArrayNotHasKey('student', $detail->inertiaProps('updates.0'));
        $this->assertArrayNotHasKey('approvalNote', $detail->inertiaProps('updates.0'));

        $template = $this->get(route('admin.placements.template'))->assertOk();
        $references = $this->get(route('admin.placements.references'))->assertOk();
        $this->assertPrivateNoStore($template->headers->all('Cache-Control'));
        $this->assertPrivateNoStore($references->headers->all('Cache-Control'));
        $this->assertStringNotContainsString('PRIVATE-STUDENT-01', $references->streamedContent());
    }

    public function test_logout_asks_the_next_inertia_page_to_clear_protected_history(): void
    {
        $this->academicUser('registrar');
        $this->get(route('admin.placements.index'))->assertOk();

        $nextPage = $this->followingRedirects()->post(route('logout'))->assertOk();

        $this->assertGuest();
        $this->assertSame(true, $nextPage->inertiaPage()['clearHistory'] ?? false);
        $this->get(route('admin.placements.index'))->assertRedirect(route('login'));
    }

    public function test_delivery_desk_marks_sensitive_responses_private_and_encrypted(): void
    {
        $this->academicUser();

        $response = $this->get(route('admin.delivery-links.index'))->assertOk();

        $this->assertPrivateNoStore($response->headers->all('Cache-Control'));
        $this->assertSame(true, $response->inertiaPage()['encryptHistory'] ?? false);
    }

    public function test_public_portal_clears_history_after_the_server_session_is_already_gone(): void
    {
        $this->academicUser('registrar');
        $this->get(route('admin.placements.index'))->assertOk();

        auth()->forgetGuards();
        session()->flush();

        $portal = $this->get(route('portal.home'))->assertOk();
        $this->assertGuest();
        $this->assertFalse($portal->inertiaProps('signedIn'));
        $this->assertSame(true, $portal->inertiaPage()['clearHistory'] ?? false);
    }

    #[TestWith([false], 'account without grants')]
    #[TestWith([true], 'guest')]
    public function test_unauthorized_request_cannot_distinguish_missing_and_existing_records(bool $guest): void
    {
        $registrar = $this->academicUser('registrar');
        $operator = $this->academicUser();
        $student = Student::factory()->create(['external_student_id' => 'PRIVATE-STUDENT-02']);
        $pin = CurriculumAdoption::factory()->create()->activeDecision;
        $row = $this->placementRow($student, $pin);
        $update = app(OfficialPlacementRegister::class)->queue($registrar, $row);
        $assignment = $this->approvedAssignment($pin, $row->programmeLevelId);
        $offering = $this->publishedOffering($operator, $pin, $assignment);
        $unknownId = (string) Str::uuid7();
        if ($guest) {
            auth()->forgetGuards();
        } else {
            $ungranted = User::factory()->create();
            $this->actingAs($ungranted)->withSession(['security.mfa_user' => $ungranted->id]);
        }
        $expected = $guest ? 302 : 403;

        foreach ([$update->id, $unknownId] as $id) {
            $read = $this->get(route('admin.placements.index', $id))->assertStatus($expected)->assertDontSee('PRIVATE-STUDENT-02');
            $approve = $this->post(route('admin.placements.approve', $id))->assertStatus($expected);
            $link = $this->post(route('admin.placements.link', $id), ['enrolment_id' => $unknownId])->assertStatus($expected);
            if ($guest) {
                $read->assertRedirect(route('login'));
                $approve->assertRedirect(route('login'));
                $link->assertRedirect(route('login'));
            }
        }
        foreach ([$offering->id, $unknownId] as $id) {
            $read = $this->get(route('admin.delivery-links.index', $id))->assertStatus($expected);
            $store = $this->post(route('admin.delivery-links.store', $id), [
                'assignment' => $assignment->id,
                'confirmation' => 'Synthetic attestation',
            ])->assertStatus($expected);
            if ($guest) {
                $read->assertRedirect(route('login'));
                $store->assertRedirect(route('login'));
            }
        }

        $this->assertDatabaseEmpty('placement_acceptances');
        $this->assertDatabaseEmpty('enrolment_academic_contexts');
        $this->assertDatabaseEmpty('offering_curriculum_courses');
        $this->assertNull($offering->refresh()->taught_course_revision_id);
    }

    /** @param list<string> $headers */
    private function assertPrivateNoStore(array $headers): void
    {
        $tokens = preg_split('/[,\s]+/', implode(',', $headers));

        $this->assertContains('private', $tokens);
        $this->assertContains('no-store', $tokens);
        $this->assertNotContains('public', $tokens);
    }
}
