<?php

namespace App\Http\Controllers\Learning;

use App\Enums\PermissionCode;
use App\Enums\TeachingPlanStatus;
use App\Http\Requests\Learning\ReviewTeachingPlanRequest;
use App\Http\Requests\Learning\SubmitTeachingPlanRequest;
use App\Models\Offering;
use App\Models\TeachingPlan;
use App\Policies\LearningPolicy;
use App\Services\Authority\ScopedAuthority;
use App\Services\Learning\TeachingPlans;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

final class TeachingPlanController
{
    public function show(Request $request, Offering $offering, LearningPolicy $policy, ScopedAuthority $authority, TeachingPlans $plans): Response
    {
        $teacher = $policy->allocated($request->user()->id, $offering);
        $reviewer = $authority->institutionAllows($request->user(), PermissionCode::OfferingsManage);
        abort_unless($teacher || $reviewer, 403);
        $history = TeachingPlan::with(['author:id,full_name', 'reviewer:id,full_name'])
            ->where('offering_id', $offering->id)->orderByDesc('revision')->get();

        return Inertia::render('Learning/TeachingPlan', [
            'shell' => $offering->external_offering_id,
            'base' => route('learning.plan', $offering),
            'back' => $reviewer ? route('academics.delivery') : route('courses.show', $offering),
            'canSubmit' => $teacher && $plans->available($offering)
                && (! $history->first() || $history->first()->status === TeachingPlanStatus::Rejected),
            'history' => $history->map(fn ($p) => [
                ...$p->only('id', 'revision', 'snapshot', 'reason', 'submitted_at', 'reviewed_at'),
                'status' => $p->status->value,
                'author' => $p->author->full_name,
                'reviewer' => $p->reviewer?->full_name,
                'canDecide' => $reviewer && $p->status === TeachingPlanStatus::Submitted && $p->author_id !== $request->user()->id,
            ]),
        ]);
    }

    public function submit(SubmitTeachingPlanRequest $request, Offering $offering, TeachingPlans $plans): RedirectResponse
    {
        $plans->submit($offering, $request->user(), $request->validated());

        return to_route('learning.plan', $offering);
    }

    public function review(ReviewTeachingPlanRequest $request, Offering $offering, TeachingPlan $plan, TeachingPlans $plans): RedirectResponse
    {
        $plans->decide($offering, $plan, $request->user(), $request->enum('decision', TeachingPlanStatus::class), $request->validated('reason'));

        return to_route('learning.plan', $offering);
    }
}
