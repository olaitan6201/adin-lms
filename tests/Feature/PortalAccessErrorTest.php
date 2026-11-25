<?php

namespace Tests\Feature;

use App\Models\Offering;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia;
use Tests\TestCase;

final class PortalAccessErrorTest extends TestCase
{
    use RefreshDatabase;

    public function test_foreign_course_offers_recovery_without_confirming_its_identity(): void
    {
        $course = Offering::factory()->create();
        $this->withoutVite()->actingAs(User::factory()->create());
        $url = route('courses.show', $course);

        $this->get($url)
            ->assertNotFound()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->component('AccessError')
                ->where('status', 404)
                ->where('returnTo', '/courses')
                ->missing('course'))
            ->assertDontSee($course->external_offering_id);

        $this->getJson($url)
            ->assertNotFound()
            ->assertJsonMissingPath('component');
    }
}
