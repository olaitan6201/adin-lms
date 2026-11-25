<?php

namespace App\Http\Controllers\Assessment;

use App\Enums\Assessment\QuestionKind;
use App\Http\Controllers\Controller;
use App\Http\Requests\Assessment\QuestionBankFilterRequest;
use App\Http\Requests\Assessment\SaveQuestionRequest;
use App\Models\Offering;
use App\Models\Question;
use App\Policies\AssessmentItemPolicy;
use App\Services\Assessment\QuestionAuthoring;
use App\Services\Assessment\QuestionBankBrowser;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class QuestionBankController extends Controller
{
    public function index(
        QuestionBankFilterRequest $request,
        Offering $offering,
        AssessmentItemPolicy $access,
        QuestionBankBrowser $browser,
    ): Response {
        abort_unless($access->teaches($request->user(), $offering), 404);
        $course = $offering->curriculumCourse?->course_id ?? abort(422, 'Offering needs a curriculum course.');
        $filters = $request->validated();
        $questions = $browser->latest($course, $filters);

        return Inertia::render('Assessments/QuestionBank', [
            'offering' => $offering->id,
            'course' => $course,
            'filters' => $filters,
            'topics' => $browser->topics($course),
            'questions' => $questions,
            'kinds' => array_map(fn (QuestionKind $kind): string => $kind->value, QuestionKind::cases()),
        ]);
    }

    public function store(
        SaveQuestionRequest $request,
        Offering $offering,
        AssessmentItemPolicy $access,
        QuestionAuthoring $authoring,
    ): RedirectResponse {
        abort_unless($access->teaches($request->user(), $offering), 404);
        $course = $offering->curriculumCourse?->course_id ?? abort(422, 'Offering needs a curriculum course.');
        $version = $authoring->create($course, $request->validated());

        return to_route('assessment.questions.show', [$offering, $version->question_id]);
    }

    public function show(
        Offering $offering,
        Question $question,
        AssessmentItemPolicy $access,
        QuestionBankBrowser $browser,
    ): Response {
        abort_unless($access->teaches(request()->user(), $offering), 404);
        $course = $offering->curriculumCourse?->course_id ?? abort(422, 'Offering needs a curriculum course.');
        $version = $browser->findLatest($question, $course);

        return Inertia::render('Assessments/QuestionPreview', [
            'offering' => $offering->id,
            'question' => $browser->detail($version),
        ]);
    }

    public function edit(
        Offering $offering,
        Question $question,
        AssessmentItemPolicy $access,
        QuestionBankBrowser $browser,
    ): Response {
        abort_unless($access->teaches(request()->user(), $offering), 404);
        $course = $offering->curriculumCourse?->course_id ?? abort(422, 'Offering needs a curriculum course.');
        $version = $browser->findLatest($question, $course);

        return Inertia::render('Assessments/QuestionEdit', [
            'offering' => $offering->id,
            'question' => $version->question_id,
            'topic' => $version->question->bank->topic,
            'values' => $browser->detail($version),
        ]);
    }

    public function update(
        SaveQuestionRequest $request,
        Offering $offering,
        Question $question,
        AssessmentItemPolicy $access,
        QuestionAuthoring $authoring,
    ): RedirectResponse {
        abort_unless($access->teaches($request->user(), $offering), 404);
        $course = $offering->curriculumCourse?->course_id ?? abort(422, 'Offering needs a curriculum course.');
        $authoring->update($question, $course, $request->validated());

        return to_route('assessment.questions.show', [$offering, $question]);
    }
}
