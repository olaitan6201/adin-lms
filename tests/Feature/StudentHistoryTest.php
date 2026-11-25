<?php

namespace Tests\Feature;

use App\Models\Enrolment;
use App\Models\Grade;
use App\Models\GradingPolicy;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia;
use Tests\TestCase;

class StudentHistoryTest extends TestCase
{
    use RefreshDatabase;

    public function test_owner_sees_last_released_result_after_withdrawal_without_course_access(): void
    {
        $this->withoutVite();
        $entry = Enrolment::factory()->create(['status' => 'withdrawn']);
        $other = User::factory()->create();
        $policy = GradingPolicy::forceCreate([
            'name' => 'Demo',
            'version' => 1,
            'rounding_rule' => 'half_up',
        ]);
        $key = ['enrolment_id' => $entry->id, 'policy_id' => $policy->id];
        Grade::forceCreate(
            $key + [
                'total_percent' => 71,
                'revision' => 1,
                'grade' => 'A',
                'approved_by' => $other->id,
                'approved_at' => now()->subDay(),
                'published_at' => now()->subHour(),
            ],
        );
        Grade::forceCreate($key + ['total_percent' => 59, 'revision' => 2, 'grade' => 'DRAFT']);
        $url = route('students.history', $entry->student_id);
        $this->actingAs($other)->get($url)->assertForbidden();
        $this->actingAs($entry->student->user)
            ->get($url)
            ->assertInertia(
                fn (AssertableInertia $page) => $page
                    ->component('StudentHistory')
                    ->has('records', 1)
                    ->where('records.0.result.grade', 'A')
                    ->where('records.0.status', 'withdrawn'),
            );
        $this->get(route('courses.show', $entry->offering_id))->assertNotFound();
    }
}
