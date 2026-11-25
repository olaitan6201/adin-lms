<?php

namespace Tests\Feature;

use App\Models\Enrolment;
use App\Models\LearningMaterial;
use App\Models\LessonProgress;
use App\Models\MaterialVersion;
use App\Models\Module;
use App\Models\User;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Tests\Feature\Insights\AssessmentFixture;
use Tests\Feature\Insights\InsightCase;

class TeachingActivityTest extends InsightCase
{
    use AssessmentFixture;

    public function test_group_progress_in_a_class_report_excludes_foreign_and_withdrawn_registrations(): void
    {
        $teacher = $this->loginAs('lecturer');
        $offering = $teacher->lecturer->allocations()->firstOrFail()->offering;
        $module = Module::factory()->create(['offering_id' => $offering->id, 'position' => 99]);
        $group = $this->record('study_groups', ['offering_id' => $offering->id, 'name' => 'Workshop group']);
        foreach ([Enrolment::factory()->create(['offering_id' => $offering->id]),
            Enrolment::factory()->withdrawn()->create(['offering_id' => $offering->id]), Enrolment::factory()->create()] as $member) {
            $this->record('group_members', ['group_id' => $group, 'enrolment_id' => $member->id]);
            LessonProgress::forceCreate(['module_id' => $module->id, 'enrolment_id' => $member->id, 'last_seen' => now(), 'completed_at' => now()]);
        }
        $groups = collect($this->data(route('workload.show', $offering))['report']['groups']);
        $this->assertSame(['id' => $group, 'name' => 'Workshop group', 'members' => 1, 'lessons' => 1], $groups->firstWhere('id', $group));
    }

    public function test_work_is_reconciled_by_recorder_offering_and_inclusive_period(): void
    {
        $this->travelTo(Carbon::parse('2026-11-25 12:00 UTC'));
        $student = $this->loginAs('ada');
        $offering = $this->assessmentFixture($student);
        $teacher = User::where('email', 'lecturer@demo.example.test')->sole();
        $path = route('staff.activity', $teacher->lecturer);
        $this->get($path)->assertForbidden();
        DB::table('assessment_scores')->where('revision', 1)->update(['changed_by' => $teacher->id]);
        DB::table('assessment_scores')->where('revision', 2)->update(['changed_by' => $student->id]);
        $class = $this->record('classes', ['offering_id' => $offering->id, 'title' => 'Studio', 'status' => 'held',
            'starts_at' => now(), 'ends_at' => now()->addHour()]);
        foreach ([$student, $teacher] as $attendee) {
            $this->record('attendance', ['class_id' => $class, 'user_id' => $attendee->id, 'status' => 'present',
                'method' => 'manual', 'recorded_by' => $teacher->id, 'recorded_at' => now()->endOfDay()->startOfSecond()]);
        }
        $file = $this->record('files', ['object_key' => 'studio', 'filename' => 'studio.pdf', 'media_type' => 'application/pdf',
            'size_bytes' => 10, 'checksum' => str_repeat('a', 64), 'validation_status' => 'clean']);
        $module = Module::factory()->create(['offering_id' => $offering->id, 'position' => 99]);
        $material = LearningMaterial::factory()->create(['module_id' => $module->id]);
        foreach ([now()->startOfDay(), now()->addDay()->startOfDay()] as $i => $time) {
            MaterialVersion::factory()->create(['material_id' => $material->id, 'file_id' => $file, 'revision' => $i + 1,
                'created_by' => $teacher->id, 'created_at' => $time]);
        }
        $this->loginAs('officer');
        $props = $this->data($path.'?from=2026-11-25&until=2026-11-25');
        $this->assertSame([['offering' => $offering->external_offering_id, 'registers' => 1, 'uploads' => 1, 'marks' => 1]], $props['rows']);
        $this->get($path.'?from=2026-11-26&until=2026-11-24')->assertSessionHasErrors('until');
        $this->loginAs('lecturer');
        $this->get($path)->assertForbidden();
        $this->assertSame(1, $this->data(route('workload.show', $offering))['report']['activity']['marks']);
    }
}
