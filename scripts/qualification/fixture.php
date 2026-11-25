<?php

use App\Models\AssessmentItem;
use App\Models\Examination;
use App\Models\ExamSlot;
use App\Models\Gradebook;
use App\Models\GradingPolicy;
use App\Models\Offering;
use App\Models\Question;
use App\Models\QuestionBank;
use App\Models\QuestionVersion;
use Illuminate\Contracts\Console\Kernel;
use Illuminate\Support\Facades\DB;

require dirname(__DIR__, 2).'/vendor/autoload.php';
$app = require dirname(__DIR__, 2).'/bootstrap/app.php';
$app->make(Kernel::class)->bootstrap();
$socket = realpath(getenv('QA_ROOT').'/socket');
$isolated = match (DB::getDriverName()) {
    'pgsql' => DB::connection()->getConfig('host') === $socket,
    'mysql' => DB::connection()->getConfig('unix_socket') === $socket.'/mysql.sock',
    default => false,
};
if (! $socket || ! app()->environment('testing') || ! $isolated || DB::getDatabaseName() !== 'qa_source'
    || base_path() !== realpath(getenv('QA_ROOT').'/app')) {
    throw new LogicException('Run the isolated qualification rehearsal.');
}

$ids = DB::transaction(function (): array {
    $course = Offering::where('external_offering_id', 'DEMO-CSC101-2026-1')->sole();
    $policy = GradingPolicy::forceCreate(['name' => 'QA', 'version' => 1, 'rounding_rule' => 'half_up']);
    $book = Gradebook::forceCreate(['offering_id' => $course->id, 'policy_id' => $policy->id]);
    $item = AssessmentItem::forceCreate([
        'gradebook_id' => $book->id, 'kind' => 'exam', 'title' => 'QA paper',
        'maximum_score' => 1, 'weight_percent' => 100,
    ]);
    $exam = Examination::forceCreate([
        'item_id' => $item->id, 'duration_seconds' => 300, 'max_attempts' => 1,
        'shuffle_options' => false, 'opens_at' => now()->subMinute(), 'closes_at' => now()->addHour(),
    ]);
    $bank = QuestionBank::forceCreate(['course_id' => $course->curriculumCourse->course_id, 'topic' => 'QA']);
    $question = Question::forceCreate(['bank_id' => $bank->id]);
    $version = QuestionVersion::forceCreate([
        'question_id' => $question->id, 'revision' => 1, 'kind' => 'gap_fill',
        'prompt' => 'Type your fixture name', 'marking_key' => ['accepted' => ['ada', 'tunde']],
    ]);
    ExamSlot::forceCreate(['exam_id' => $exam->id, 'position' => 1, 'fixed_version_id' => $version->id, 'points' => 1]);

    return [$course->id, $exam->id];
});
echo json_encode($ids, JSON_THROW_ON_ERROR);
