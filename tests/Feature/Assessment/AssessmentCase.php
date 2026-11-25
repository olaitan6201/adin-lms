<?php

namespace Tests\Feature\Assessment;

use App\Models\AssessmentItem;
use App\Models\CurriculumCourse;
use App\Models\Enrolment;
use App\Models\Lecturer;
use App\Models\Offering;
use App\Models\TeachingAllocation;
use App\Models\User;
use Database\Seeders\AuthoritySeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

abstract class AssessmentCase extends TestCase
{
    use RefreshDatabase;

    protected Offering $offering;

    protected Enrolment $member;

    protected User $marker;

    protected User $officer;

    protected string $desk;

    protected function setUp(): void
    {
        parent::setUp();
        $this->withoutVite();
        $this->seed(AuthoritySeeder::class);
        $this->offering = Offering::factory()->create(['curriculum_course_id' => CurriculumCourse::factory()]);
        $this->member = Enrolment::factory()->create(['offering_id' => $this->offering->id]);
        $lecturer = Lecturer::factory()->create();
        $this->marker = $lecturer->user;
        $this->officer = User::factory()->create();
        TeachingAllocation::factory()->create([
            'offering_id' => $this->offering->id,
            'lecturer_id' => $lecturer->id,
        ]);
        $this->artisan('authority:grant', [
            'user' => $this->marker->id,
            'role' => 'lecturer',
            'scope' => 'offering:'.$this->offering->id,
        ])->assertSuccessful();
        $this->artisan('authority:grant', [
            'user' => $this->officer->id,
            'role' => 'examination_officer',
            'scope' => 'institution',
        ])->assertSuccessful();
        $this->desk = "/courses/{$this->offering->id}/assessments";
    }

    protected function as(User $user): static
    {
        return $this->actingAs($user)->withSession(['security.mfa_user' => $user->id]);
    }

    protected function setupItems(array $kinds): void
    {
        $items = array_map(fn ($kind) => [
            'kind' => $kind,
            'title' => $kind,
            'weight' => 100 / count($kinds),
            'maximum' => '10',
        ], $kinds);
        $this->as($this->marker)->post($this->desk, [
            'rounding' => 'half_up',
            'items' => $items,
            'boundaries' => [['minimum' => '0', 'grade' => 'F'], ['minimum' => '75', 'grade' => 'A']],
        ])->assertSessionHasNoErrors()->assertRedirect();
        $this->assertSame(count($items), AssessmentItem::count());
    }
}
