<?php

namespace Tests\Feature\Learning;

use App\Models\Enrolment;
use App\Models\Offering;
use App\Models\User;
use Database\Seeders\DemoCampusSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

abstract class LearningTestCase extends TestCase
{
    use RefreshDatabase;

    protected Offering $offering;

    protected User $teacher;

    protected User $learner;

    protected string $base;

    protected function setUp(): void
    {
        parent::setUp();
        $this->withoutVite();
        $this->seed(DemoCampusSeeder::class);
        $this->teacher = User::whereEmail('lecturer@demo.example.test')->firstOrFail();
        $this->learner = User::whereEmail('ada@demo.example.test')->firstOrFail();
        $this->offering = Offering::whereExternalOfferingId('DEMO-CSC101-2026-1')->firstOrFail();
        $this->base = route('learning.index', $this->offering);
    }

    protected function withdraw(): void
    {
        Enrolment::where('student_id', $this->learner->student->id)->where('offering_id', $this->offering->id)->update(['status' => 'withdrawn']);
    }
}
