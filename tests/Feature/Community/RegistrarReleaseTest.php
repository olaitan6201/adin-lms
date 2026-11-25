<?php

namespace Tests\Feature\Community;

use App\Models\AssessmentItem;
use App\Models\Assignment;
use App\Models\Enrolment;
use App\Models\Notification;
use App\Models\NotificationDelivery;
use App\Models\Semester;
use App\Models\Student;
use App\Services\Roster\ImportRosterFile;
use Tests\Feature\Assessment\AssessmentCase;

final class RegistrarReleaseTest extends AssessmentCase
{
    public function test_delayed_release_uses_the_current_registration_interval_not_the_last_revision(): void
    {
        $this->offering->forceFill([
            'status' => 'published', 'semester_id' => Semester::factory()->create()->id,
            'section' => 'A', 'delivery_mode' => 'blended', 'approved_by' => $this->officer->id, 'approved_at' => now(),
        ])->save();
        $this->setupItems(['assignment']);
        $item = AssessmentItem::sole();
        $this->post("/assessment-items/$item->id/assignment", [
            'instructions' => 'Review the reading', 'opens_at' => now()->addMinutes(10)->toISOString(),
            'due_at' => now()->addMinutes(20)->toISOString(), 'closes_at' => now()->addMinutes(30)->toISOString(),
            'formats' => ['txt'], 'max_bytes' => 200,
        ])->assertRedirect()->assertSessionHasNoErrors();
        $assignment = Assignment::sole();
        $continuous = Student::factory()->create();
        $before = Student::factory()->create();
        $after = Student::factory()->create();
        $legacy = Enrolment::factory()->create(['offering_id' => $this->offering->id, 'enrolled_at' => null]);
        foreach ([$continuous, $before, $after] as $student) {
            $this->feed($student, 'registered', 1);
        }
        $this->travel(1)->minute();
        $this->feed($before, 'withdrawn', 2);
        $this->feed($after, 'withdrawn', 2);
        $this->travel(1)->minute();
        $this->feed($before, 'registered', 3);
        $this->travel(31)->minutes();
        $this->feed($after, 'registered', 3);
        $this->feed($before, 'registered', 4);
        $this->feed($continuous, 'registered', 2);
        $this->feed($legacy->student, 'registered', 2);
        $this->artisan('community:notify')->assertSuccessful();
        $this->artisan('community:notify')->assertSuccessful();

        foreach (["assignment:$assignment->id", "deadline:$assignment->id:".$assignment->due_at->timestamp] as $key) {
            $notices = Notification::where('event_key', $key);
            $this->assertEqualsCanonicalizing(
                [$this->member->student->user_id, $continuous->user_id, $before->user_id, $legacy->student->user_id],
                $notices->pluck('recipient_id')->all(),
            );
            $this->assertSame(4, NotificationDelivery::whereIn('notification_id', $notices->select('id'))->count());
        }
        $this->assertNull($continuous->enrolments()->sole()->enrolled_at);
    }

    private function feed(Student $student, string $status, int $revision): void
    {
        $path = tempnam(sys_get_temp_dir(), 'registration-');
        try {
            file_put_contents($path, "student_id,offering_id,status,revision\n"
                ."{$student->external_student_id},{$this->offering->external_offering_id},$status,$revision\n");
            $this->assertSame(1, app(ImportRosterFile::class)->import($path));
        } finally {
            unlink($path);
        }
    }
}
