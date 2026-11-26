<?php

namespace Tests\Feature;

use App\Models\Student;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia;
use Tests\Support\AcademicAccess;
use Tests\TestCase;

class PortalShellTest extends TestCase
{
    use AcademicAccess, RefreshDatabase;

    public function test_guest_and_unverified_privileged_session_receive_no_account_or_destinations(): void
    {
        $hidden = fn (AssertableInertia $page) => $page->where('portalIdentity', null)
            ->where('signedIn', false)->has('academicLinks', 0);
        $this->get('/login')->assertInertia($hidden);

        $this->academicUser();
        $this->withSession(['security.mfa_user' => 'another-account']);
        $this->get('/courses')->assertRedirectToRoute('security.challenge');
        $this->get('/security/challenge')->assertInertia($hidden);
    }

    public function test_verified_admin_receives_granted_role_and_authorized_destinations(): void
    {
        $user = $this->academicUser();
        $this->get('/courses')->assertInertia(fn (AssertableInertia $page) => $page
            ->where('portalIdentity.name', $user->full_name)->where('portalIdentity.role', 'Institutional Admin')
            ->where('academicLinks', fn ($links) => $links->pluck('href')->contains('/students')
                && $links->pluck('href')->contains('/staff') && ! $links->pluck('href')->contains('/guardian')));
        $this->get('/students')->assertOk();
        $this->get('/staff')->assertOk();
    }

    public function test_student_profile_and_calendar_are_available_on_partial_visits_without_admin_links(): void
    {
        $user = User::factory()->create();
        Student::factory()->for($user)->create();
        $this->actingAs($user->fresh())->get('/courses')->assertInertia(fn (AssertableInertia $page) => $page
            ->reloadOnly('signedIn', fn (AssertableInertia $partial) => $partial
                ->where('portalIdentity.name', $user->full_name)->where('portalIdentity.role', 'Student')
                ->where('academicLinks', fn ($links) => $links->pluck('href')->contains('/calendar')
                    && $links->pluck('href')->contains('/student/downloads') && $links->pluck('href')->contains('/community/notification-settings')
                    && ! $links->pluck('href')->contains('/admin/qa') && ! $links->pluck('href')->contains('/students') && ! $links->pluck('href')->contains('/staff'))));
        $this->get('/calendar')->assertOk();
        $this->get('/students')->assertForbidden();
    }

    public function test_account_without_a_profile_or_grant_is_not_mislabeled_as_a_student(): void
    {
        $user = User::factory()->create();
        $this->actingAs($user->fresh())->get('/profile')->assertInertia(fn (AssertableInertia $page) => $page
            ->where('portalIdentity.name', $user->full_name)->where('portalIdentity.role', 'Portal member')
            ->where('academicLinks', fn ($links) => ! $links->pluck('href')->contains('/student/downloads')));
    }

    public function test_quality_review_link_requires_compliance_permission(): void
    {
        $this->academicUser('quality_assurance_officer');
        $this->get('/courses')->assertInertia(fn (AssertableInertia $page) => $page
            ->where('academicLinks', fn ($links) => $links->pluck('href')->contains('/admin/qa')));
        $this->get('/admin/qa')->assertOk();
    }

    public function test_guardian_calendar_link_requires_an_academic_profile_or_grant(): void
    {
        $user = $this->academicUser('guardian');
        $this->get('/guardian')->assertInertia(fn (AssertableInertia $page) => $page
            ->where('academicLinks', fn ($links) => $links->pluck('href')->contains('/guardian')
                && ! $links->pluck('href')->contains('/calendar')));

        $this->artisan('authority:grant', ['user' => $user->id, 'role' => 'examination_officer', 'scope' => 'institution'])
            ->assertSuccessful();
        $this->get('/guardian')->assertInertia(fn (AssertableInertia $page) => $page
            ->where('academicLinks', fn ($links) => $links->pluck('href')->contains('/calendar')));
    }
}
