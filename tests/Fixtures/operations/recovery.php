<?php

use App\Models\AssessmentItem;
use App\Models\AttemptQuestion;
use App\Models\Examination;
use App\Models\ExaminationAttempt;
use App\Models\File;
use App\Models\Gradebook;
use App\Models\GradingPolicy;
use App\Models\Offering;
use App\Models\Question;
use App\Models\QuestionBank;
use App\Models\QuestionVersion;
use App\Services\Assessment\ExamSession;
use Illuminate\Contracts\Console\Kernel;
use Illuminate\Support\Facades\DB;

require dirname(__DIR__, 3).'/vendor/autoload.php';
$app = require dirname(__DIR__, 3).'/bootstrap/app.php';
$app->make(Kernel::class)->bootstrap();
$base = realpath(getenv('REHEARSAL_DIR'));
if (! $base || ! str_starts_with($base, base_path('.agent-work/recovery.')) || ! app()->environment('testing')
    || DB::getDatabaseName() !== 's18_source' || DB::connection()->getConfig('host') !== $base) {
    throw new LogicException('Use the disposable recovery rehearsal script.');
}
DB::transaction(function () use ($base): void {
    $offering = Offering::where('external_offering_id', 'DEMO-CSC101-2026-1')->sole();
    $policy = GradingPolicy::forceCreate(['name' => 'Recovery fixture', 'version' => 1, 'rounding_rule' => 'half_up']);
    $book = Gradebook::forceCreate(['offering_id' => $offering->id, 'policy_id' => $policy->id]);
    $item = AssessmentItem::forceCreate(['gradebook_id' => $book->id, 'title' => 'Practice', 'kind' => 'exam',
        'weight_percent' => 100, 'maximum_score' => 1]);
    $exam = Examination::forceCreate(['item_id' => $item->id, 'opens_at' => now(), 'closes_at' => now()->addHour(),
        'duration_seconds' => 300, 'max_attempts' => 1, 'shuffle_options' => false]);
    $bank = QuestionBank::forceCreate(['course_id' => $offering->curriculumCourse->course_id, 'topic' => 'Recovery fixture']);
    $question = Question::forceCreate(['bank_id' => $bank->id]);
    $version = QuestionVersion::forceCreate(['question_id' => $question->id, 'revision' => 1, 'kind' => 'essay', 'prompt' => 'Describe soil.']);
    $enrolment = $offering->enrolments()->where('status', 'registered')->firstOrFail();
    $attempt = ExaminationAttempt::forceCreate(['exam_id' => $exam->id, 'enrolment_id' => $enrolment->id,
        'ordinal' => 1, 'started_at' => now(), 'expires_at' => now()->addMinutes(5), 'state' => 'active']);
    $slot = AttemptQuestion::forceCreate(['attempt_id' => $attempt->id, 'position' => 1, 'version_id' => $version->id, 'possible_points' => 1]);
    foreach (['Draft answer', 'Revised answer'] as $index => $value) {
        app(ExamSession::class)->save($enrolment->student->user, $attempt, $slot->id, $index, $value);
    }
    $path = $base.'/objects/field.txt';
    copy(__DIR__.'/field.txt', $path);
    File::forceCreate(['object_key' => 'field.txt', 'filename' => 'field.txt', 'media_type' => 'text/plain',
        'size_bytes' => filesize($path), 'checksum' => hash_file('sha256', $path), 'validation_status' => 'clean']);
});
