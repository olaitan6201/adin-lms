<?php

namespace App\Http\Controllers\Learning;

use App\Http\Requests\Learning\LessonRequest;
use App\Models\Enrolment;
use App\Models\LessonProgress;
use App\Models\Module;
use App\Models\Offering;
use App\Policies\LearningPolicy;
use App\Services\Learning\LessonCatalogue;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

final class ContentController
{
    public function index(Request $request, Offering $offering, LearningPolicy $policy, LessonCatalogue $catalogue): Response
    {
        $staff = $policy->audience($request->user(), $offering);

        return Inertia::render('Learning/Content', ['base' => route('learning.index', $offering), 'title' => $offering->external_offering_id, 'staff' => $staff,
            'lessons' => $catalogue->lessons($offering, $staff, $policy->enrolment($request->user()->id, $offering))]);
    }

    public function save(LessonRequest $request, Offering $offering, ?Module $lesson = null): RedirectResponse
    {
        abort_if($lesson && $lesson->offering_id !== $offering->id, 404);
        ($lesson ?? new Module)->forceFill([...$request->safe()->except(['published', 'kind']), 'offering_id' => $offering->id,
            'opens_at' => $request->date('opens_at')?->utc(), 'closes_at' => $request->date('closes_at')?->utc(),
            'kind' => ($request->boolean('published') ? '' : 'draft:').$request->validated('kind')])->save();

        return to_route('learning.index', $offering);
    }

    public function complete(Request $request, Offering $offering, Module $lesson, LearningPolicy $policy): RedirectResponse
    {
        abort_unless($offering->status === 'published' && $lesson->offering_id === $offering->id && $policy->released($lesson), 404);
        DB::transaction(function () use ($policy, $request, $offering, $lesson): void {
            $id = $policy->enrolment($request->user()->id, $offering)?->id;
            Enrolment::whereKey($id)->where('status', 'registered')->lockForUpdate()->firstOrFail();
            $record = LessonProgress::where('enrolment_id', $id)->where('module_id', $lesson->id)->first() ?? new LessonProgress;
            if (! $record->completed_at) {
                $record->forceFill(['enrolment_id' => $id, 'module_id' => $lesson->id, 'last_seen' => now(), 'completed_at' => now()])->save();
            }
        });

        return to_route('learning.index', $offering);
    }
}
