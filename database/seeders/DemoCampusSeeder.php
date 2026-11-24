<?php

namespace Database\Seeders;

use App\Enums\EnrolmentStatus;
use App\Models\AcademicLevel;
use App\Models\AcademicSession;
use App\Models\Course;
use App\Models\Curriculum;
use App\Models\CurriculumCourse;
use App\Models\Department;
use App\Models\Enrolment;
use App\Models\Faculty;
use App\Models\LearningMaterial;
use App\Models\Lecturer;
use App\Models\MaterialVersion;
use App\Models\Module;
use App\Models\Offering;
use App\Models\Programme;
use App\Models\Semester;
use App\Models\Student;
use App\Models\TeachingAllocation;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use LogicException;

class DemoCampusSeeder extends Seeder
{
    public function run(): void
    {
        if (! app()->environment('local', 'testing')) {
            throw new LogicException('Demo accounts are restricted to local and test environments.');
        }

        DB::transaction(fn () => $this->seedCampus());
    }

    private function seedCampus(): void
    {
        $faculty = $this->fixture(Faculty::class, ['code' => 'DEMO-SCI'], ['name' => 'Science (demo)']);
        $dept = $this->fixture(Department::class, ['code' => 'DEMO-CS'], ['name' => 'Computing', 'faculty_id' => $faculty->id]);
        $programme = $this->fixture(Programme::class, ['code' => 'DEMO-BSC'], ['name' => 'BSc Computing', 'department_id' => $dept->id]);
        $level = $this->fixture(AcademicLevel::class, ['label' => '100 (demo)']);
        $session = $this->fixture(AcademicSession::class, ['label' => '2026/27 (demo)'], ['starts_on' => '2026-09-01', 'ends_on' => '2027-07-31']);
        $semester = $this->fixture(Semester::class, ['session_id' => $session->id, 'position' => 1], ['starts_on' => '2026-09-01', 'ends_on' => '2027-01-31']);
        $author = $this->account('lecturer', 'Demo Lecturer');
        $lecturer = $this->fixture(Lecturer::class, ['staff_number' => 'DEMO-L1'], ['user_id' => $author->id, 'department_id' => $dept->id]);
        $curriculum = $this->fixture(Curriculum::class, ['programme_id' => $programme->id, 'version' => 1], [
            'status' => 'approved', 'approved_by' => $this->account('officer', 'Demo Academic Officer')->id, 'approved_at' => now(),
        ]);
        $learners = [];
        foreach (['ada' => 'Ada Demo', 'tunde' => 'Tunde Demo'] as $login => $name) {
            $learners[$login] = $this->fixture(Student::class, ['external_student_id' => 'DEMO-'.strtoupper($login)], [
                'user_id' => $this->account($login, $name)->id, 'matric_number' => 'DEMO/26/'.strtoupper($login),
            ]);
        }

        foreach (['CSC101' => 'Introduction to Computing', 'CSC102' => 'Programming Fundamentals'] as $code => $title) {
            $course = $this->fixture(Course::class, ['code' => 'DEMO-'.$code], ['department_id' => $dept->id]);
            $entry = $this->fixture(CurriculumCourse::class, ['course_id' => $course->id, 'curriculum_id' => $curriculum->id], [
                'level_id' => $level->id, 'title' => $title, 'description' => "First-year introduction to {$title}.",
            ]);
            $offering = $this->fixture(Offering::class, ['external_offering_id' => "DEMO-{$code}-2026-1"], [
                'curriculum_course_id' => $entry->id, 'semester_id' => $semester->id, 'section' => 'A',
                'delivery_mode' => 'blended', 'status' => 'published', 'approved_by' => $curriculum->approved_by, 'approved_at' => now(),
            ]);
            $this->fixture(TeachingAllocation::class, ['lecturer_id' => $lecturer->id, 'offering_id' => $offering->id]);
            if ($code === 'CSC101') {
                $nextTerm = $this->fixture(Semester::class, ['session_id' => $session->id, 'position' => 2], [
                    'starts_on' => '2027-02-01', 'ends_on' => '2027-07-31',
                ]);
                $nextOffering = $this->fixture(Offering::class, ['external_offering_id' => 'DEMO-CSC101-2026-2'], [
                    'curriculum_course_id' => $entry->id, 'semester_id' => $nextTerm->id, 'section' => 'A',
                    'delivery_mode' => 'blended', 'status' => 'draft',
                ]);
                $this->fixture(TeachingAllocation::class, ['lecturer_id' => $lecturer->id, 'offering_id' => $nextOffering->id]);
            }
            $this->seedChapter($offering, $author, $title);
            foreach ($learners as $login => $student) {
                $withdrawn = $login === 'tunde' && $code === 'CSC102';
                $this->fixture(Enrolment::class, ['student_id' => $student->id, 'offering_id' => $offering->id], [
                    'status' => $withdrawn ? EnrolmentStatus::Withdrawn : EnrolmentStatus::Registered,
                    'source_revision' => $withdrawn ? 2 : 1,
                ]);
            }
        }
    }

    private function seedChapter(Offering $offering, User $author, string $title): void
    {
        $module = $this->fixture(Module::class, ['offering_id' => $offering->id, 'position' => 1], [
            'title' => "Getting started: {$title}", 'body' => 'Read the introduction and write down one question for class.',
        ]);
        $material = $this->fixture(LearningMaterial::class, ['module_id' => $module->id, 'title' => 'First reading']);
        $this->fixture(MaterialVersion::class, ['material_id' => $material->id, 'revision' => 1], [
            'created_by' => $author->id, 'body' => "Describe an everyday problem that {$title} could help solve.",
        ]);
    }

    private function account(string $login, string $name): User
    {
        return $this->fixture(User::class, ['email' => "{$login}@demo.example.test"], ['full_name' => $name]);
    }

    /** @template T of Model
     * @param  class-string<T>  $class
     * @return T
     */
    private function fixture(string $class, array $key, array $attributes = []): Model
    {
        return $class::query()->where($key)->first() ?? $class::factory()->create($key + $attributes);
    }
}
