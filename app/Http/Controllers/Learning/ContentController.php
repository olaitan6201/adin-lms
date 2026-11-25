<?php

namespace App\Http\Controllers\Learning;

use App\Enums\Learning\LessonKind;
use App\Http\Requests\Learning\LessonRequest;
use App\Http\Requests\Learning\OrderActivitiesRequest;
use App\Models\Module;
use App\Models\Offering;
use App\Policies\LearningPolicy;
use App\Services\Learning\CourseAssessments;
use App\Services\Learning\CourseOutline;
use App\Services\Learning\LessonCatalogue;
use App\Services\Learning\LessonCompletion;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

final class ContentController
{
    public function index(
        Request $request,
        Offering $offering,
        LearningPolicy $policy,
        LessonCatalogue $catalogue,
        CourseAssessments $assessments,
    ): Response {
        $staff = $policy->audience($request->user(), $offering);
        $preview = $staff && $request->boolean('preview');
        $authoring = $staff && ! $preview;

        return Inertia::render('Learning/Content', [
            'base' => route('learning.index', $offering),
            'title' => $offering->curriculumCourse?->title ?? $offering->external_offering_id,
            'overview' => route('courses.show', $offering),
            'staff' => $authoring,
            'preview' => $preview,
            'canTeach' => $staff,
            'startOverview' => $authoring && $request->query('compose') === 'overview',
            'quizzes' => $authoring ? $assessments->rows($offering, true, null)->where('type', 'Quiz')
                ->values()->map(fn ($row) => ['id' => parse_url($row['href'], PHP_URL_PATH).'#item-'.$row['id'], 'title' => $row['title']]) : [],
            'lessonKinds' => array_column(LessonKind::cases(), 'value'),
            'lessons' => $preview && ! $policy->published($offering) ? [] : $catalogue->lessons(
                $offering,
                $authoring,
                $policy->enrolment($request->user()->id, $offering),
            ),
        ]);
    }

    public function save(
        LessonRequest $request,
        Offering $offering,
        ?Module $lesson = null,
    ): RedirectResponse {
        abort_if($lesson && $lesson->offering_id !== $offering->id, 404);
        ($lesson ?? new Module)
            ->forceFill([
                ...$request->safe()->except(['published', 'kind']),
                'offering_id' => $offering->id,
                'opens_at' => $request->date('opens_at')?->utc(),
                'closes_at' => $request->date('closes_at')?->utc(),
                'kind' => $request
                    ->enum('kind', LessonKind::class)
                    ->stored($request->boolean('published')),
            ])
            ->saveOrFail();

        return to_route('learning.index', $offering);
    }

    public function order(OrderActivitiesRequest $request, Offering $offering, CourseOutline $outline): RedirectResponse
    {
        $outline->reorder($offering, $request->user(), $request->validated('activities'));

        return to_route('courses.show', $offering);
    }

    public function complete(
        Request $request,
        Offering $offering,
        Module $lesson,
        LearningPolicy $policy,
        LessonCompletion $completion,
    ): RedirectResponse {
        abort_unless(
            $policy->published($offering) &&
                $lesson->offering_id === $offering->id &&
                $policy->released($lesson),
            404,
        );
        $completion->complete($policy->enrolment($request->user()->id, $offering)?->id, $lesson);

        return to_route('learning.index', $offering);
    }
}
