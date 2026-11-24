<?php

namespace Tests\Feature;

use App\Models\Enrolment;
use App\Models\MaterialVersion;
use App\Models\Offering;
use Database\Seeders\DemoCampusSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia;
use Tests\TestCase;

class DemoCampusSeederTest extends TestCase
{
    use RefreshDatabase;

    public function test_demo_roster_can_be_reseeded_and_used_for_student_login(): void
    {
        $this->withoutVite();
        $this->seed();
        $original = Enrolment::orderBy('id')->pluck('id')->all();
        $this->seed();
        $this->assertCount(4, $original);
        $this->assertSame($original, Enrolment::orderBy('id')->pluck('id')->all());
        $this->assertDatabaseCount('users', 4);
        $nextTerm = Offering::where('external_offering_id', 'DEMO-CSC101-2026-2')->sole();
        $this->assertSame(2, $nextTerm->semester->position);
        $this->assertDatabaseHas('teaching_allocations', ['offering_id' => $nextTerm->id]);
        $this->assertDatabaseMissing('enrolments', ['offering_id' => $nextTerm->id]);
        $this->assertDatabaseCount('material_versions', 2);
        foreach (MaterialVersion::all() as $version) {
            $this->assertTrue($version->material->module->offering->exists);
            $this->assertSame('lecturer@demo.example.test', $version->createdBy->email);
        }

        $this->post('/login', ['email' => 'tunde@demo.example.test', 'password' => 'password'])->assertRedirect(route('courses.index'));
        $this->get('/courses')->assertInertia(fn (AssertableInertia $page) => $page
            ->has('courses', 1)->where('courses.0.external_offering_id', 'DEMO-CSC101-2026-1'));
        $withdrawn = Offering::where('external_offering_id', 'DEMO-CSC102-2026-1')->sole();
        $this->get(route('courses.show', $withdrawn))->assertNotFound();
    }

    public function test_production_seed_does_not_create_demo_accounts(): void
    {
        $this->app->instance('env', 'production');
        $this->artisan('db:seed', ['--force' => true])->assertSuccessful();
        $this->assertDatabaseEmpty('users');
        $this->expectException(\LogicException::class);
        $this->app->make(DemoCampusSeeder::class)->run();
    }
}
