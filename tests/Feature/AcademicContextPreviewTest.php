<?php

namespace Tests\Feature;

use App\Enums\CurriculumStatus;
use App\Enums\OfferingStatus;
use App\Models\AcademicSession;
use App\Models\CourseRevision;
use App\Models\CurriculumAdoption;
use App\Models\CurriculumAdoptionDecision;
use App\Models\CurriculumCourse;
use App\Models\Enrolment;
use App\Models\Offering;
use App\Models\ProgrammeLevel;
use App\Models\Semester;
use App\Models\Student;
use App\Services\Academics\AcademicContextPreview;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Tests\TestCase;

final class AcademicContextPreviewTest extends TestCase
{
    use RefreshDatabase;

    public function test_initial_preview_only_resolves_an_approved_exact_tuple_and_programme_level(): void
    {
        $adoption = CurriculumAdoption::factory()->create();
        $decision = $adoption->activeDecision;
        $pathway = $decision->academicPathway;
        $session = $decision->academicSession;
        $cohort = $decision->entryCohort;
        $level = ProgrammeLevel::factory()->for($pathway->programme, 'programme')->create();
        $otherLevel = ProgrammeLevel::factory()->create();
        $otherSession = AcademicSession::factory()->create();
        $preview = app(AcademicContextPreview::class);

        $this->assertTrue($decision->is($preview->initialAdoption($pathway, $session, $cohort, $level)));
        $this->assertNull($preview->initialAdoption($pathway, $session, $cohort, $otherLevel));
        $this->assertNull($preview->initialAdoption($pathway, $otherSession, $cohort, $level));

        $decision->curriculum->forceFill(['status' => CurriculumStatus::Reviewed])->save();
        $this->assertNull($preview->initialAdoption($pathway, $session, $cohort, $level));
        $this->assertDatabaseCount('student_sessions', 0);
        $this->assertDatabaseCount('enrolments', 0);
    }

    public function test_an_existing_pin_is_checked_without_resolving_the_new_operative_adoption(): void
    {
        $adoption = CurriculumAdoption::factory()->create();
        $pin = $adoption->activeDecision;
        $assignment = $this->assignmentFor($pin);
        $enrolment = $this->enrolmentFor($pin, $assignment);
        $association = (string) Str::uuid7();
        DB::table('offering_curriculum_courses')->insert([
            'id' => $association, 'offering_id' => $enrolment->offering_id, 'curriculum_course_id' => $assignment->id,
            'linked_by' => $pin->approved_by, 'confirmation_note' => 'Confirmed taught revision.',
            'confirmed_at' => now(),
        ]);

        $next = $pin->curriculum->replicate()->forceFill(['version' => 2]);
        $next->save();
        $replacement = $pin->replicate()->forceFill(['curriculum_id' => $next->id]);
        $replacement->save();
        $adoption->forceFill(['active_decision_id' => $replacement->id])->save();

        $preview = app(AcademicContextPreview::class);
        $this->assertSame($association, $preview->enrolmentAssociation($enrolment, $enrolment->student, $pin));
        $this->assertNull($preview->enrolmentAssociation($enrolment, $enrolment->student, $replacement));
        $this->assertNull($preview->enrolmentAssociation($enrolment, Student::factory()->create(), $pin));
        DB::table('offering_curriculum_courses')->where('id', $association)->update(['confirmation_note' => '   ']);
        $this->assertNull($preview->enrolmentAssociation($enrolment, $enrolment->student, $pin));
        DB::table('offering_curriculum_courses')->where('id', $association)->update(['confirmation_note' => 'Confirmed taught revision.']);

        $otherRevision = CourseRevision::factory()->approved()->create();
        $enrolment->offering->forceFill(['taught_course_revision_id' => $otherRevision->id])->save();
        DB::table('offering_curriculum_courses')->where('id', $association)->update(['equivalence_reference' => 'UNVERIFIED']);
        $this->assertNull($preview->enrolmentAssociation($enrolment, $enrolment->student, $pin));
        $this->assertDatabaseHas('curriculum_adoptions', ['id' => $adoption->id, 'active_decision_id' => $replacement->id]);
        $this->assertSame($pin->curriculum_id, $assignment->fresh()->curriculum_id);
    }

    public function test_exact_link_requires_a_valid_recorded_confirmation_instant(): void
    {
        $pin = CurriculumAdoption::factory()->create()->activeDecision;
        $assignment = $this->assignmentFor($pin);
        $enrolment = $this->enrolmentFor($pin, $assignment);
        $association = (string) Str::uuid7();
        $links = DB::table('offering_curriculum_courses');
        $links->insert([
            'id' => $association,
            'offering_id' => $enrolment->offering_id,
            'curriculum_course_id' => $assignment->id,
            'linked_by' => $pin->approved_by,
            'confirmation_note' => 'Confirmed taught revision.',
            'confirmed_at' => '2026-06-15 11:00:00',
        ]);
        $preview = app(AcademicContextPreview::class);
        $this->assertSame($association, $preview->enrolmentAssociation($enrolment, $enrolment->student, $pin));

        // Typed server columns reject malformed text; SQLite can retain it from historical writes.
        $invalidInstants = DB::connection()->getDriverName() === 'sqlite'
            ? ['2026-02-30 11:00:00', "2026-11-28 10:11:12\0", '2026-11-28 10:11:12 now']
            : [null];

        $link = $links->where('id', $association);
        foreach ($invalidInstants as $instant) {
            $this->assertSame(1, $link->update(['confirmed_at' => $instant]));
            $this->assertSame($instant, (clone $link)->value('confirmed_at'));
            $this->assertNull($preview->enrolmentAssociation($enrolment, $enrolment->student, $pin));
        }
    }

    private function assignmentFor(CurriculumAdoptionDecision $pin): CurriculumCourse
    {
        $programme = $pin->curriculum->academic_programme_id;
        $level = ProgrammeLevel::factory()->create(['academic_programme_id' => $programme]);
        $revision = CourseRevision::factory()->approved()->create();

        return CurriculumCourse::factory()->create([
            'curriculum_id' => $pin->curriculum_id,
            'course_id' => $revision->course_id,
            'course_revision_id' => $revision->id,
            'academic_programme_id' => $programme,
            'programme_level_id' => $level->id,
            'category' => 'core',
            'requirement_mode' => 'individual',
        ]);
    }

    private function enrolmentFor(CurriculumAdoptionDecision $pin, CurriculumCourse $assignment): Enrolment
    {
        $term = Semester::factory()->for($pin->academicSession, 'session')->create();
        $offering = Offering::factory()->create([
            'curriculum_course_id' => $assignment->id,
            'taught_course_revision_id' => $assignment->course_revision_id,
            'semester_id' => $term->id,
            'section' => 'A',
            'delivery_mode' => 'online',
            'status' => OfferingStatus::Published,
            'approved_at' => now(),
            'approved_by' => $pin->approved_by,
        ]);

        return Enrolment::factory()->for($offering)->create();
    }
}
