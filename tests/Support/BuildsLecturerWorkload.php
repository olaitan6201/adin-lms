<?php

namespace Tests\Support;

use App\Models\AcademicSession;
use App\Models\Course;
use App\Models\CurriculumCourse;
use App\Models\Enrolment;
use App\Models\Lecturer;
use App\Models\Offering;
use App\Models\Semester;
use App\Models\TeachingAllocation;
use App\Models\User;
use Database\Seeders\AuthoritySeeder;

trait BuildsLecturerWorkload
{
    use BuildsWorkloadResults;

    /** @return array{user: User, currentTerm: Semester, otherTerm: Semester, first: Offering, second: Offering, other: Offering} */
    private function fixture(): array
    {
        $this->seed(AuthoritySeeder::class);
        $user = User::factory()->create();
        $lecturer = Lecturer::factory()->create(['user_id' => $user->id]);
        $currentTerm = Semester::factory()->create([
            'session_id' => AcademicSession::factory()->create([
                'label' => '2026/2027',
                'starts_on' => '2026-09-01',
            ]),
            'starts_on' => '2026-09-01',
        ]);
        $otherTerm = Semester::factory()->create([
            'session_id' => AcademicSession::factory()->create([
                'label' => '2025/2026',
                'starts_on' => '2025-09-01',
            ]),
            'starts_on' => '2025-09-01',
        ]);
        $first = $this->offering($currentTerm, 'CSC101', 'Algorithms');
        $second = $this->offering($currentTerm, 'CSC102', 'Databases');
        $other = $this->offering($otherTerm, 'CSC201', 'Software Engineering');
        foreach ([$first, $second, $other] as $offering) {
            TeachingAllocation::factory()->create([
                'lecturer_id' => $lecturer->id,
                'offering_id' => $offering->id,
            ]);
            $this->artisan('authority:grant', [
                'user' => $user->id,
                'role' => 'lecturer',
                'scope' => 'offering:'.$offering->id,
            ])->assertSuccessful();
        }

        $this->withSession(['security.mfa_user' => $user->id]);
        TeachingAllocation::factory()->create(['offering_id' => $first->id]);

        $firstActive = Enrolment::factory()->create(['offering_id' => $first->id]);
        $firstCompleted = Enrolment::factory()->create([
            'offering_id' => $first->id,
            'completed_at' => now(),
        ]);
        $withdrawn = Enrolment::factory()
            ->withdrawn()
            ->create(['offering_id' => $first->id]);
        $secondActive = Enrolment::factory()->create(['offering_id' => $second->id]);
        $otherActive = Enrolment::factory()->create(['offering_id' => $other->id]);
        Enrolment::factory()
            ->count(3)
            ->create(['offering_id' => $other->id]);

        $this->grade($firstActive, '60.00000000', 1, true, $user);
        $this->grade($firstActive, '80.00000000', 2, true, $user);
        $this->grade($firstActive, '91.12345678', 3, false, $user);
        $scheduled = $this->grade($firstActive, '99.50000000', 4, true, $user);
        $scheduled->forceFill(['published_at' => now()->addDay()])->save();
        $this->grade($firstCompleted, '70.00000000', 1, true, $user);
        $this->grade($withdrawn, '92.12345678', 1, true, $user);
        $this->grade($secondActive, '50.00000000', 1, true, $user);
        $this->grade($otherActive, '93.12345678', 1, true, $user);

        return compact('user', 'currentTerm', 'otherTerm', 'first', 'second', 'other');
    }

    private function offering(Semester $term, string $code, string $title): Offering
    {
        return Offering::factory()->create([
            'semester_id' => $term->id,
            'curriculum_course_id' => CurriculumCourse::factory()->create([
                'course_id' => Course::factory()->create(['code' => $code]),
                'title' => $title,
            ])->id,
        ]);
    }
}
