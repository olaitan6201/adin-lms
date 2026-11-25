<?php

namespace Tests\Feature\Assessment;

use App\Models\AssessmentItem;
use App\Models\AttemptQuestion;
use App\Models\CurriculumCourse;
use App\Models\Examination;
use App\Models\ExaminationAttempt;
use App\Models\Offering;
use App\Models\Question;
use App\Models\QuestionBank;
use App\Models\QuestionVersion;
use Inertia\Testing\AssertableInertia as Page;

class QuestionBankTest extends AssessmentCase
{
    public function test_author_can_browse_preview_and_append_a_revision_without_changing_a_fixed_paper(): void
    {
        $this->setupItems(['exam']);
        $item = AssessmentItem::sole();
        $bank = "/courses/{$this->offering->id}/question-banks";
        $payload = [
            'topic' => 'Security',
            'kind' => 'mcq',
            'prompt' => 'Original prompt',
            'options' => "First\nSecond",
            'accepted' => 'Second',
        ];

        $this->as($this->marker)->get($bank)->assertInertia(fn (Page $page) => $page->component('Assessments/QuestionBank'));
        $this->as($this->marker)->post($bank, $payload)->assertRedirect();
        $question = Question::sole();
        $version = QuestionVersion::sole();
        $this->assertSame('Original prompt', $version->prompt);
        $this->assertSame(['Second'], $version->marking_key['accepted']);
        $this->as($this->marker)->post("/assessment-items/$item->id/exam", $this->selection($version->id))
            ->assertSessionHasNoErrors();
        $this->as($this->marker)->put("/courses/{$this->offering->id}/questions/$question->id", [
            ...$payload,
            'prompt' => 'Revised prompt',
        ])->assertRedirect();
        $this->assertSame(2, QuestionVersion::where('question_id', $question->id)->count());
        $this->assertSame('Original prompt', $version->fresh()->prompt);
        $this->get("/courses/{$this->offering->id}/questions/$question->id")
            ->assertInertia(fn (Page $page) => $page
                ->where('question.prompt', 'Revised prompt')
                ->where('question.revision', 2)
                ->where('question.marking_key.accepted', ['Second']));

        $this->as($this->member->student->user)->post('/examinations/'.Examination::sole()->id.'/start')->assertRedirect();
        $attempt = ExaminationAttempt::sole();
        $this->assertSame($version->id, AttemptQuestion::where('attempt_id', $attempt->id)->sole()->version_id);
        $this->get("/attempts/$attempt->id")->assertInertia(fn (Page $page) => $page
            ->where('questions.0.prompt', 'Original prompt')
            ->missing('questions.0.marking_key'));
    }

    public function test_bank_routes_hide_other_offerings_and_require_an_author(): void
    {
        $this->setupItems(['exam']);
        $other = Offering::factory()->create(['curriculum_course_id' => CurriculumCourse::factory()]);
        $bank = "/courses/{$this->offering->id}/question-banks";
        $payload = [...$this->questionPayload(), 'topic' => 'Private'];

        auth()->logout();
        $this->get($bank)->assertRedirect('/login');
        $this->as($this->member->student->user)->get($bank)->assertNotFound();
        $this->as($this->marker)->post("/courses/{$other->id}/question-banks", $payload)->assertNotFound();
        $this->assertSame(0, Question::count());
        $this->as($this->marker)->post($bank, $payload)->assertRedirect();
        $question = Question::sole();
        $this->as($this->marker)->get("/courses/{$other->id}/questions/$question->id")->assertNotFound();
        $this->as($this->marker)->put("/courses/{$other->id}/questions/$question->id", $payload)->assertNotFound();
        $this->assertSame(1, QuestionVersion::count());
    }

    public function test_selection_rejects_duplicate_cross_course_and_incorrect_point_totals(): void
    {
        $this->setupItems(['exam']);
        $item = AssessmentItem::sole();
        $this->as($this->marker)->post("/courses/{$this->offering->id}/question-banks", $this->questionPayload())->assertRedirect();
        $version = QuestionVersion::sole();
        $url = "/assessment-items/$item->id/exam";
        $duplicate = $this->selection($version->id);
        $duplicate['selections'][] = $duplicate['selections'][0];
        $this->as($this->marker)->post($url, $duplicate)->assertSessionHasErrors('selections');
        $this->assertSame(0, Examination::count());

        $otherCourse = CurriculumCourse::factory()->create();
        $otherBank = QuestionBank::forceCreate(['course_id' => $otherCourse->course_id, 'topic' => 'Other']);
        $otherQuestion = Question::forceCreate(['bank_id' => $otherBank->id]);
        $otherVersion = QuestionVersion::forceCreate([
            'question_id' => $otherQuestion->id,
            'revision' => 1,
            'kind' => 'mcq',
            'prompt' => 'Other course',
            'options' => ['A', 'B'],
            'marking_key' => ['accepted' => ['A']],
        ]);
        $this->as($this->marker)->post($url, $this->selection($otherVersion->id))->assertNotFound();
        $this->assertSame(0, Examination::count());

        $short = $this->selection($version->id);
        $short['selections'][0]['points'] = '9';
        $this->as($this->marker)->post($url, $short)->assertSessionHasErrors('questions');
        $this->assertSame(0, Examination::count());
    }

    private function questionPayload(): array
    {
        return [
            'topic' => 'Basics',
            'kind' => 'mcq',
            'prompt' => 'Choose the safe answer',
            'options' => "Unsafe\nSafe",
            'accepted' => 'Safe',
        ];
    }

    private function selection(string $version): array
    {
        return [
            'opens_at' => now()->subHour(),
            'closes_at' => now()->addHour(),
            'duration_seconds' => 600,
            'max_attempts' => 1,
            'selections' => [['version_id' => $version, 'points' => '10']],
        ];
    }
}
