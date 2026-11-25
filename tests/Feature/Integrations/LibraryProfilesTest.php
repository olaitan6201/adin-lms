<?php

namespace Tests\Feature\Integrations;

use App\Models\RoleGrant;
use App\Models\User;
use Database\Seeders\AuthoritySeeder;
use Database\Seeders\DemoStaffAuthoritySeeder;
use Inertia\Testing\AssertableInertia as Page;
use Tests\Feature\Learning\LearningTestCase;

final class LibraryProfilesTest extends LearningTestCase
{
    private string $catalogue = 'https://library.example.test/catalogue';

    protected function setUp(): void
    {
        parent::setUp();
        $entry = ['url' => $this->catalogue, 'label' => 'Course texts',
            'offerings' => [$this->offering->external_offering_id], 'roles' => ['learner']];
        config(['integrations.libraries' => [
            'texts' => $entry,
            'staff' => ['roles' => ['instructor']] + $entry,
            'other' => ['offerings' => ['another-offering']] + $entry,
            'invalid' => ['url' => 'http://library.example.test/catalogue'] + $entry,
        ]]);
        $this->base = route('integrations.index', $this->offering);
    }

    public function test_library_partner_receives_only_registered_destination_without_identity_or_referrer(): void
    {
        $open = $this->base.'/library/texts';
        $this->get($open)->assertRedirect();
        $this->actingAs($this->learner)->get($this->base)->assertInertia(fn (Page $page) => $page
            ->component('Integrations/Resources')->has('links', 1)->where('links.0.href', $open));
        $this->get($open.'?destination=https://ignored.example.test&role=instructor')
            ->assertRedirect($this->catalogue)->assertHeader('Referrer-Policy', 'no-referrer');
        foreach (['staff', 'invalid', 'other'] as $profile) {
            $this->get($this->base.'/library/'.$profile)->assertNotFound();
        }
        $this->withdraw();
        $this->get($open)->assertNotFound();
        $this->actingAs(User::factory()->create())->get($this->base)->assertNotFound();
    }

    public function test_allocated_instructor_needs_current_offering_grant_even_on_direct_link(): void
    {
        $open = $this->base.'/library/staff';
        $this->actingAs($this->teacher)->get($open)->assertNotFound();
        $this->seed(AuthoritySeeder::class);
        $this->seed(DemoStaffAuthoritySeeder::class);
        $this->actingAs($this->teacher->fresh())->withSession(['security.mfa_user' => $this->teacher->id])
            ->get($open)->assertRedirect($this->catalogue);
        $this->get($this->base.'/library/texts')->assertNotFound();
        RoleGrant::where('user_id', $this->teacher->id)->delete();
        $this->get($open)->assertNotFound();
    }
}
