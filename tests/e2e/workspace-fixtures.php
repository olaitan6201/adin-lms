<?php

use App\Enums\RoleCode;
use App\Models\AcademicSession;
use App\Models\AssessmentItem;
use App\Models\Assignment;
use App\Models\Enrolment;
use App\Models\Gradebook;
use App\Models\LearningMaterial;
use App\Models\Lecturer;
use App\Models\MaterialVersion;
use App\Models\Module;
use App\Models\Offering;
use App\Models\Semester;
use App\Models\Student;
use App\Models\TeachingAllocation;
use App\Models\User;
use App\Services\Authority\ChangeRoleGrant;
use App\Services\Security\TotpEnrollment;

/** Called only after enroll-test-staff validates the disposable database. */
function seedWorkspaceFixtures(Offering $source, string $project, string $run): void
{
    $session = AcademicSession::factory()->create(['label' => "Dashboard $project"]);
    $first = Semester::factory()->create(['session_id' => $session->id]);
    $next = Semester::factory()->create(['session_id' => $session->id, 'position' => 2]);
    Offering::factory()->create(['semester_id' => $next->id, 'external_offering_id' => "Z-DRAFT-$project"]);
    $template = AssessmentItem::where('title', 'Computing reflection')->sole();
    $assignment = Assignment::where('item_id', $template->id)->sole();
    foreach (['dashboard', 'workspace'] as $scenario) {
        $login = "$scenario-learner-$project";
        $learner = User::factory()->create(['email' => "$login@demo.example.test"]);
        $course = Offering::factory()->create($source->only(['delivery_mode', 'approved_by', 'approved_at']) + [
            'curriculum_course_id' => $source->curriculum_course_id, 'section' => "$scenario-$project", 'status' => 'published',
            'semester_id' => $scenario === 'dashboard' ? $first->id : $source->semester_id,
            'external_offering_id' => "Z-CSC101-$scenario-$project",
        ]);
        $student = Student::factory()->create(['user_id' => $learner->id]);
        Enrolment::factory()->create(['offering_id' => $course->id, 'student_id' => $student->id]);
        $module = Module::factory()->create(['offering_id' => $course->id]);
        $material = LearningMaterial::factory()->create(['module_id' => $module->id, 'title' => 'First reading']);
        MaterialVersion::factory()->create(['material_id' => $material->id]);
        $book = Gradebook::forceCreate(['offering_id' => $course->id, 'policy_id' => $template->gradebook->policy_id]);
        $item = $template->replicate();
        $item->gradebook_id = $book->id;
        $item->title = "Computing reflection · $scenario $project";
        $item->save();
        $copy = $assignment->replicate();
        $copy->item_id = $item->id;
        $copy->save();
        if ($scenario === 'dashboard') {
            $author = User::factory()->create(['email' => "dashboard-lecturer-$project@demo.example.test"]);
            $lecturer = Lecturer::factory()->create(['user_id' => $author->id]);
            TeachingAllocation::factory()->create(['lecturer_id' => $lecturer->id, 'offering_id' => $course->id]);
            app(ChangeRoleGrant::class)->apply($author->id, RoleCode::Lecturer, 'offering:'.$course->id, false);
            file_put_contents("$run/dashboard-lecturer-$project.factor", app(TotpEnrollment::class)->issue($author), LOCK_EX);
        }
    }
    foreach (['dashboard', 'report'] as $scenario) {
        $login = "$scenario-officer-$project";
        $officer = User::factory()->create(['email' => "$login@demo.example.test"]);
        app(ChangeRoleGrant::class)->apply($officer->id, RoleCode::InstitutionalAdmin, 'institution', false);
        file_put_contents("$run/$login.factor", app(TotpEnrollment::class)->issue($officer), LOCK_EX);
    }
}
