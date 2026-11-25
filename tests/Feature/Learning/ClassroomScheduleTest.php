<?php

namespace Tests\Feature\Learning;

use App\Enums\Learning\ClassStatus;
use App\Models\LearningMaterial;
use App\Models\Offering;
use Inertia\Testing\AssertableInertia as Page;

class ClassroomScheduleTest extends LearningTestCase
{
    public function test_schedule_recording_and_join_link_are_scoped_even_on_direct_visits(): void
    {
        $session = $this->schedule('Laboratory', ClassStatus::Scheduled);
        $url = $this->base.'/classes/'.$session->id;
        $other = Offering::whereExternalOfferingId('DEMO-CSC102-2026-1')->sole();
        $data = [
            'title' => 'Lab II',
            'status' => 'scheduled',
            'starts_at' => '2026-10-03T08:00:00Z',
            'ends_at' => '2026-10-03T10:00:00Z',
        ];
        $this->post($url, [...$data, 'status' => 'unknown'])->assertSessionHasErrors('status');
        $this->post($url, [...$data, 'ends_at' => '2026-10-02'])->assertSessionHasErrors('ends_at');
        $this->post(route('learning.classes.save', [$other, $session]), $data)->assertNotFound();
        $material = fn ($offering) => LearningMaterial::whereHas(
            'module',
            fn ($q) => $q->whereOfferingId($offering->id),
        )->sole();
        $this->post($url, [
            ...$data,
            'recording_material_id' => $material($other)->id,
        ])->assertSessionHasErrors('recording_material_id');
        $this->post($url, [
            ...$data,
            'recording_material_id' => $material($this->offering)->id,
        ])->assertSessionHasNoErrors();
        $this->actingAs($this->learner)
            ->get($this->base.'/classes')
            ->assertInertia(
                fn (Page $p) => $p
                    ->where('sessions.0.title', 'Lab II')
                    ->where('sessions.0.recording_material_id', $material($this->offering)->id)
                    ->where('percentage', null)
                    ->has('participants', 0),
            );
        $this->get(route('learning.classes', $other))->assertInertia(
            fn (Page $p) => $p->has('sessions', 0),
        );
        $this->post($url, $data)->assertForbidden();
        $this->withdraw();
        $this->get($this->base.'/classes')->assertNotFound();
    }
}
