<?php

namespace App\Http\Controllers\Learning;

use App\Enums\Learning\LessonKind;
use App\Http\Requests\Learning\LessonRequest;
use App\Models\Module;
use App\Models\Offering;
use App\Policies\LearningPolicy;
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
    ): Response {
        $staff = $policy->audience($request->user(), $offering);

        return Inertia::render('Learning/Content', [
            'base' => route('learning.index', $offering),
            'title' => $offering->external_offering_id,
            'staff' => $staff,
            'lessonKinds' => array_column(LessonKind::cases(), 'value'),
            'lessons' => $catalogue->lessons(
                $offering,
                $staff,
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
            ->save();

        return to_route('learning.index', $offering);
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
