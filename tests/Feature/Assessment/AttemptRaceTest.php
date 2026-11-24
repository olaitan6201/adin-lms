<?php

namespace Tests\Feature\Assessment;

use App\Models\AssessmentItem;
use App\Models\AttemptQuestion;
use App\Models\CurriculumCourse;
use App\Models\Enrolment;
use App\Models\Examination;
use App\Models\ExaminationAttempt;
use App\Models\ExamSlot;
use App\Models\Gradebook;
use App\Models\GradingPolicy;
use App\Models\Offering;
use App\Models\Question;
use App\Models\QuestionBank;
use App\Models\QuestionVersion;
use App\Services\Assessment\ExamSession;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class AttemptRaceTest extends TestCase
{
    public function test_two_connections_starting_together_allocate_one_last_attempt(): void
    {
        if (! function_exists('pcntl_fork')) {
            $this->markTestSkipped('Concurrent test requires pcntl.');
        }
        $path = tempnam(sys_get_temp_dir(), 'assessment-race-');
        config(['database.default' => 'race', 'database.connections.race' => ['driver' => 'sqlite', 'database' => $path, 'foreign_key_constraints' => true, 'busy_timeout' => 5000]]);
        try {
            $this->artisan('migrate', ['--database' => 'race', '--force' => true])->assertSuccessful();
            $entry = CurriculumCourse::factory()->create();
            $offering = Offering::factory()->create(['curriculum_course_id' => $entry->id]);
            $member = Enrolment::factory()->create(['offering_id' => $offering->id]);
            $user = $member->student->user;
            $policy = GradingPolicy::forceCreate(['name' => 'Race', 'version' => 1, 'rounding_rule' => 'half_up']);
            $book = Gradebook::forceCreate(['offering_id' => $offering->id, 'policy_id' => $policy->id]);
            $item = AssessmentItem::forceCreate(['gradebook_id' => $book->id, 'kind' => 'exam', 'title' => 'Race', 'maximum_score' => 10, 'weight_percent' => 100]);
            $exam = Examination::forceCreate(['item_id' => $item->id, 'duration_seconds' => 600, 'max_attempts' => 1, 'shuffle_options' => false, 'opens_at' => now()->subHour(), 'closes_at' => now()->addHour()]);
            $bank = QuestionBank::forceCreate(['course_id' => $entry->course_id, 'topic' => 'Concurrency']);
            $question = Question::forceCreate(['bank_id' => $bank->id]);
            $v = QuestionVersion::forceCreate(['question_id' => $question->id, 'revision' => 1, 'kind' => 'essay', 'prompt' => 'Explain']);
            ExamSlot::forceCreate(['exam_id' => $exam->id, 'position' => 1, 'fixed_version_id' => $v->id, 'points' => 10]);
            DB::purge('race');
            [$parent,$child] = stream_socket_pair(STREAM_PF_UNIX, STREAM_SOCK_STREAM, 0);
            $pid = pcntl_fork();
            $this->assertGreaterThanOrEqual(0, $pid);
            if ($pid === 0) {
                fclose($parent);
                fread($child, 1);
                try {
                    $id = app(ExamSession::class)->start($user, $exam)->id;
                } catch (\Throwable $e) {
                    $id = $e->getMessage();
                }
                fwrite($child, $id);
                fclose($child);
                exit(0);
            }
            fclose($child);
            fwrite($parent, '1');
            $first = app(ExamSession::class)->start($user, $exam);
            $second = stream_get_contents($parent);
            fclose($parent);
            pcntl_waitpid($pid, $status);
            $this->assertSame($first->id, $second);
            $this->assertSame(1, ExaminationAttempt::count());
            $this->assertSame(1, AttemptQuestion::count());
        } finally {
            DB::purge('race');
            unlink($path);
        }
    }
}
