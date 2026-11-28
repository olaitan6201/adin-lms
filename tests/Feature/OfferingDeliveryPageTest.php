<?php

namespace Tests\Feature;

use App\Enums\CurriculumStatus;
use App\Enums\TeachingPlanStatus;
use App\Models\AcademicSession;
use App\Models\Course;
use App\Models\Curriculum;
use App\Models\CurriculumCourse;
use App\Models\Offering;
use App\Models\Programme;
use App\Models\Semester;
use App\Models\TeachingPlan;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia;
use Tests\Support\AcademicAccess;
use Tests\TestCase;

final class OfferingDeliveryPageTest extends TestCase
{
    use AcademicAccess, RefreshDatabase;

    public function test_delivery_reads_require_the_institutional_offering_management_permission(): void
    {
        $this->get(route('academics.delivery'))->assertRedirect(route('login'));
        $this->academicUser('quality_assurance_officer');
        $this->get(route('academics.delivery'))->assertForbidden();
    }

    public function test_delivery_returns_only_the_existing_fields_in_their_established_order(): void
    {
        $actor = $this->academicUser();
        $entryB = $this->entry('BBB-101', 'Second course');
        $entryA = $this->entry('AAA-101', 'First course');
        $termOld = $this->term('2027/28', '2027-09-01', '2028-01-31');
        $termNew = $this->term('2028/29', '2028-09-01', '2029-01-31');
        $laterSection = Offering::factory()->create(['external_offering_id' => 'SECTION-B']);
        $firstSection = Offering::factory()->create([
            'external_offering_id' => 'SECTION-A',
            'curriculum_course_id' => $entryA->id,
            'semester_id' => $termNew->id,
            'section' => 'A',
            'delivery_mode' => 'online',
            'copied_from' => $laterSection->id,
        ]);
        $this->plan($actor, $firstSection, 2, TeachingPlanStatus::Submitted, '2028-09-03 10:00:00');
        $this->plan($actor, $laterSection, 1, TeachingPlanStatus::Submitted, '2028-09-02 10:00:00');
        $this->plan($actor, $firstSection, 1, TeachingPlanStatus::Approved, '2028-09-01 10:00:00');

        $this->get(route('academics.delivery'))->assertOk()->assertInertia(fn (AssertableInertia $page) => $page
            ->component('Academics/Delivery')
            ->where('offerings', [
                ['id' => $firstSection->id, 'external_offering_id' => 'SECTION-A', 'status' => 'draft',
                    'curriculum_course_id' => $entryA->id, 'semester_id' => $termNew->id, 'section' => 'A',
                    'delivery_mode' => 'online', 'copied_from' => $laterSection->id],
                ['id' => $laterSection->id, 'external_offering_id' => 'SECTION-B', 'status' => 'draft',
                    'curriculum_course_id' => null, 'semester_id' => null, 'section' => null,
                    'delivery_mode' => null, 'copied_from' => null],
            ])
            ->where('entries', [
                ['id' => $entryA->id, 'title' => 'First course', 'code' => 'AAA-101', 'version' => 2, 'name' => 'Legacy programme'],
                ['id' => $entryB->id, 'title' => 'Second course', 'code' => 'BBB-101', 'version' => 2, 'name' => 'Legacy programme'],
            ])
            ->where('terms', [
                ['id' => $termNew->id, 'label' => '2028/29', 'position' => 1],
                ['id' => $termOld->id, 'label' => '2027/28', 'position' => 1],
            ])
            ->where('modes', ['online', 'blended', 'face-to-face'])
            ->where('pendingPlans', [
                ['offering_id' => $laterSection->id, 'external_offering_id' => 'SECTION-B', 'revision' => 1],
                ['offering_id' => $firstSection->id, 'external_offering_id' => 'SECTION-A', 'revision' => 2],
            ])
            ->etc());
    }

    private function entry(string $code, string $title): CurriculumCourse
    {
        $programme = Programme::factory()->create(['name' => 'Legacy programme']);
        $curriculum = Curriculum::factory()->create([
            'programme_id' => $programme->id,
            'version' => 2,
            'status' => CurriculumStatus::Approved,
        ]);

        return CurriculumCourse::factory()->create([
            'curriculum_id' => $curriculum->id,
            'course_id' => Course::factory()->create(['code' => $code])->id,
            'title' => $title,
        ]);
    }

    private function term(string $label, string $startsOn, string $endsOn): Semester
    {
        $session = AcademicSession::factory()->create([
            'label' => $label,
            'starts_on' => $startsOn,
            'ends_on' => $endsOn,
        ]);

        return Semester::factory()->create([
            'session_id' => $session->id,
            'starts_on' => $startsOn,
            'ends_on' => $endsOn,
        ]);
    }

    private function plan(User $actor, Offering $offering, int $revision, TeachingPlanStatus $status, string $submittedAt): void
    {
        TeachingPlan::forceCreate([
            'offering_id' => $offering->id,
            'author_id' => $actor->id,
            'revision' => $revision,
            'status' => $status,
            'submitted_at' => $submittedAt,
            'snapshot' => ['internal_note' => 'Not part of the register'],
        ]);
    }
}
