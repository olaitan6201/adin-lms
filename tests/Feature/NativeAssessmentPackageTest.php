<?php

namespace Tests\Feature;

use App\Models\AssessmentItem;
use App\Models\Assignment;
use App\Models\AssignmentReference;
use App\Models\AttemptQuestion;
use App\Models\CurriculumCourse;
use App\Models\Enrolment;
use App\Models\Examination;
use App\Models\ExaminationAttempt;
use App\Models\ExamSlot;
use App\Models\Grade;
use App\Models\Gradebook;
use App\Models\LearningMaterial;
use App\Models\Lecturer;
use App\Models\MaterialVersion;
use App\Models\Module;
use App\Models\Offering;
use App\Models\QuestionBank;
use App\Models\TeachingAllocation;
use App\Services\Assessment\BuildExamination;
use App\Services\Learning\PrivateUpload;
use Dompdf\Dompdf;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Tests\Feature\Assessment\AssessmentCase;
use ZipArchive;

class NativeAssessmentPackageTest extends AssessmentCase
{
    private string $pdf;

    private function mixedCourse(): void
    {
        Storage::fake('local');
        $document = new Dompdf;
        $document->loadHtml('<h1>Field methods</h1><p>Record two observations.</p>');
        $document->render();
        $this->pdf = $document->output();
        $this->setupItems(['assignment', 'exam']);
        $lesson = Module::factory()->create(['offering_id' => $this->offering->id]);
        $material = LearningMaterial::factory()->create(['module_id' => $lesson->id]);
        $file = app(PrivateUpload::class)->store(UploadedFile::fake()->createWithContent('Reading.pdf', $this->pdf));
        MaterialVersion::factory()->create(['material_id' => $material->id, 'file_id' => $file->id]);
        $assignment = AssessmentItem::where('kind', 'assignment')->sole();
        $assignment->forceFill(['module_id' => $lesson->id, 'rubric' => ['guide' => 'Evidence', 'criteria' => [[
            'id' => (string) Str::uuid7(), 'title' => 'Analysis', 'description' => null,
            'levels' => [
                ['id' => (string) Str::uuid7(), 'label' => 'Absent', 'points' => '0', 'description' => null],
                ['id' => (string) Str::uuid7(), 'label' => 'Complete', 'points' => '10', 'description' => 'Full evidence'],
            ],
        ]]]])->save();
        $exam = AssessmentItem::where('kind', 'exam')->sole();
        $window = ['opens_at' => now()->subHour()->startOfSecond(), 'closes_at' => now()->addDay()->startOfSecond()];
        $this->post("/assessment-items/$assignment->id/assignment", $window + [
            'due_at' => now()->addHour(), 'instructions' => 'Summarise the reading.', 'max_bytes' => 20000,
            'formats' => ['txt', 'pdf'], 'reference' => UploadedFile::fake()->createWithContent('Brief.pdf', $this->pdf),
        ])->assertSessionHasNoErrors();
        app(BuildExamination::class)->run($exam, $window + [
            'duration_seconds' => 1200, 'max_attempts' => 2, 'shuffle' => true,
            'questions' => [
                ['topic' => 'Soils', 'prompt' => 'Name the texture.', 'kind' => 'gap_fill', 'key' => 'PRIVATE_KEY', 'points' => '6.25'],
                ['topic' => 'Soils', 'prompt' => 'Describe the site.', 'kind' => 'essay', 'points' => '3.75', 'draw' => true],
            ],
        ]);
        $assignment = Assignment::sole();
        $this->as($this->member->student->user)->post("/assignments/$assignment->id", ['body' => 'PRIVATE_SCRIPT'])->assertRedirect();
        $exam = Examination::sole();
        $this->post("/examinations/$exam->id/start")->assertRedirect();
        $attempt = ExaminationAttempt::sole();
        $slot = AttemptQuestion::where('attempt_id', $attempt->id)->orderBy('position')->firstOrFail();
        $this->putJson("/attempts/$attempt->id/answers/$slot->id", ['revision' => 0, 'answer' => 'PRIVATE_RESPONSE'])->assertOk();
        Grade::forceCreate(['enrolment_id' => $this->member->id, 'policy_id' => Gradebook::sole()->policy_id, 'revision' => 1,
            'total_percent' => 61, 'grade' => 'C', 'moderation_note' => 'PRIVATE_GRADE']);
    }

    public function test_restores_assessments_to_a_different_course_with_local_ids_and_no_personal_records(): void
    {
        $this->mixedCourse();
        $target = Offering::factory()->create(['curriculum_course_id' => CurriculumCourse::factory()]);
        $path = "/operations/courses/{$this->offering->id}/export/native";
        $this->getJson($path)->assertForbidden();
        $this->as($this->officer)->getJson($path)->assertForbidden();
        $this->artisan('authority:grant', ['user' => $this->officer->id, 'role' => 'institutional_admin', 'scope' => 'institution'])->assertSuccessful();
        $this->getJson($path)->assertForbidden();
        $this->authorizeExchange();
        $download = $this->as($this->marker)->get($path)->assertOk()->assertDownload();
        $package = UploadedFile::fake()->createWithContent('Course.zip', $download->getContent());
        $zip = new ZipArchive;
        $zip->open($package->getPathname());
        $manifest = $zip->getFromName('backup.json');
        $this->assertStringContainsString('PRIVATE_KEY', $manifest);
        foreach (['PRIVATE_SCRIPT', 'PRIVATE_RESPONSE', 'PRIVATE_GRADE', $this->member->id, $this->officer->id, $this->offering->id] as $private) {
            $this->assertStringNotContainsString($private, $manifest);
        }
        $zip->close();
        $this->as($this->marker)->postJson("/operations/courses/$target->id/import", ['package' => $package])->assertForbidden();
        $this->authorizeTarget($target);
        $this->postJson("/operations/courses/$target->id/import", ['package' => $package])->assertCreated()->assertJsonPath('imported', 4);
        $book = Gradebook::where('offering_id', $target->id)->sole();
        $item = AssessmentItem::where('gradebook_id', $book->id)->where('kind', 'assignment')->sole();
        $this->assertSame($target->id, $item->module->offering_id);
        $original = AssessmentItem::where('kind', 'assignment')->whereKeyNot($item->id)->sole();
        $this->assertSame('Full evidence', $item->rubric['criteria'][0]['levels'][1]['description']);
        $this->assertNotSame($original->rubric['criteria'][0]['id'], $item->rubric['criteria'][0]['id']);
        $assignment = Assignment::where('item_id', $item->id)->sole();
        $file = AssignmentReference::where('assignment_id', $assignment->id)->sole()->file;
        $this->assertSame('Brief.pdf', $file->filename);
        $this->assertSame($this->pdf, Storage::disk('local')->get($file->object_key));
        $this->assertStringStartsWith('assessments/', $file->object_key);
        $source = Assignment::whereKeyNot($assignment->id)->sole();
        $this->assertEquals($source->due_at, $assignment->due_at);
        $exam = Examination::where('item_id', AssessmentItem::where('gradebook_id', $book->id)->where('kind', 'exam')->sole()->id)->sole();
        $slots = ExamSlot::where('exam_id', $exam->id)->orderBy('position')->get();
        $this->assertSame($target->curriculumCourse->course_id, $slots[0]->fixedVersion->question->bank->course_id);
        $this->assertSame(['PRIVATE_KEY'], $slots[0]->fixedVersion->marking_key['accepted']);
        $this->assertSame($slots[0]->fixedVersion->question->bank_id, $slots[1]->draw_from_bank_id);
        foreach (['submissions', 'submission_versions', 'examination_responses', 'examination_attempts', 'enrolments', 'grades'] as $table) {
            $this->assertDatabaseCount($table, 1);
        }
        $newMember = Enrolment::factory()->create(['offering_id' => $target->id]);
        $this->as($newMember->student->user)->get("/assignments/$assignment->id/files/$file->id")->assertDownload('Brief.pdf');
        $this->as($newMember->student->user)->post("/examinations/$exam->id/start")->assertRedirect();
        $attempt = ExaminationAttempt::where('exam_id', $exam->id)->sole();
        $this->get("/attempts/$attempt->id")->assertOk()->assertDontSee('PRIVATE_KEY');
        $this->assertSame(2, AttemptQuestion::where('attempt_id', $attempt->id)->count());
    }

    public function test_cross_course_slot_is_rejected_and_bank_conflict_cannot_mutate_destination(): void
    {
        $this->mixedCourse();
        $this->authorizeExchange();
        $path = "/operations/courses/{$this->offering->id}/export/native";
        $download = $this->as($this->marker)->get($path)->assertOk();
        $target = Offering::factory()->create(['curriculum_course_id' => $this->offering->curriculum_course_id]);
        $this->authorizeTarget($target);
        $this->postJson("/operations/courses/$target->id/import", ['package' => UploadedFile::fake()->createWithContent('same.zip', $download->getContent())])->assertConflict();
        $this->assertDatabaseMissing('modules', ['offering_id' => $target->id]);
        $this->assertDatabaseCount('files', 2);
        $package = UploadedFile::fake()->createWithContent('broken.zip', $download->getContent());
        $zip = new ZipArchive;
        $zip->open($package->getPathname());
        $manifest = json_decode($zip->getFromName('backup.json'), true, flags: JSON_THROW_ON_ERROR);
        foreach ($manifest['assessment']['items'] as &$item) {
            if ($item['kind'] === 'exam') {
                $item['definition']['slots'][0]['fixed'] = [0, 500, 0];
            }
        }
        $zip->addFromString('backup.json', json_encode($manifest, JSON_THROW_ON_ERROR));
        $zip->close();
        $this->postJson("/operations/courses/$target->id/import", ['package' => $package])->assertUnprocessable();
        $this->assertDatabaseMissing('gradebooks', ['offering_id' => $target->id]);
        $this->assertDatabaseMissing('audit_logs', ['action' => 'course.imported', 'subject_key' => $target->id]);
        $foreign = QuestionBank::forceCreate(['topic' => 'Other department', 'course_id' => CurriculumCourse::factory()->create()->course_id]);
        ExamSlot::whereNotNull('draw_from_bank_id')->update(['draw_from_bank_id' => $foreign->id]);
        $this->getJson($path)->assertUnprocessable()->assertJsonValidationErrors('package');
    }

    private function authorizeExchange(): void
    {
        $this->artisan('authority:grant', ['user' => $this->marker->id, 'role' => 'institutional_admin', 'scope' => 'institution'])->assertSuccessful();
    }

    private function authorizeTarget(Offering $target): void
    {
        TeachingAllocation::factory()->create(['offering_id' => $target->id, 'lecturer_id' => Lecturer::where('user_id', $this->marker->id)->sole()->id]);
        $this->artisan('authority:grant', ['user' => $this->marker->id, 'role' => 'lecturer', 'scope' => "offering:$target->id"])->assertSuccessful();
    }
}
