<?php

namespace App\Services\Learning;

use App\Enums\Learning\LessonKind;
use App\Enums\OfferingStatus;
use App\Enums\TeachingPlanStatus;
use App\Models\Module;
use App\Models\Offering;
use App\Models\TeachingPlan;
use App\Models\User;
use App\Policies\LearningPolicy;
use Illuminate\Support\Facades\DB;

final class TeachingPlans
{
    public function __construct(private LearningPolicy $policy) {}

    public function available(Offering $shell): bool
    {
        return $shell->status === OfferingStatus::Draft && ! Module::where('offering_id', $shell->id)->exists();
    }

    public function submit(Offering $offering, User $author, array $data): void
    {
        DB::transaction(function () use ($offering, $author, $data): void {
            $shell = Offering::lockForUpdate()->findOrFail($offering->id);
            abort_unless($this->policy->allocated($author->id, $shell), 403);
            $latest = TeachingPlan::where('offering_id', $shell->id)->latest('revision')->first();
            $revision = (int) $data['previous_revision'] + 1;
            $content = [
                'title' => $data['title'],
                'introduction' => $data['introduction'],
                'weeks' => $data['weeks'],
            ];
            if ($latest?->revision === $revision && $latest->author_id === $author->id &&
                $content['title'] === $latest->snapshot['title'] &&
                $content['introduction'] === $latest->snapshot['introduction'] &&
                array_column($content['weeks'], 'title') === array_column($latest->snapshot['weeks'], 'title') &&
                array_column($content['weeks'], 'body') === array_column($latest->snapshot['weeks'], 'body')) {
                return;
            }

            abort_unless($this->available($shell), 409, 'Teaching plans require an empty draft shell.');
            abort_if($revision !== ($latest?->revision ?? 0) + 1 ||
                ($latest && $latest->status !== TeachingPlanStatus::Rejected), 409, 'Reload the current proposal.');
            TeachingPlan::forceCreate([
                'offering_id' => $shell->id,
                'author_id' => $author->id,
                'revision' => $revision,
                'status' => TeachingPlanStatus::Submitted,
                'snapshot' => $content + ['shell' => $this->identity($shell)],
                'submitted_at' => now(),
            ]);
        }, 3);
    }

    public function decide(Offering $offering, TeachingPlan $proposal, User $reviewer, TeachingPlanStatus $decision, ?string $reason): void
    {
        DB::transaction(function () use ($offering, $proposal, $reviewer, $decision, $reason): void {
            $shell = Offering::lockForUpdate()->findOrFail($offering->id);
            $plan = TeachingPlan::where('offering_id', $shell->id)->lockForUpdate()->findOrFail($proposal->id);
            abort_if($plan->author_id === $reviewer->id, 403, 'Another authorised reviewer must decide.');
            if ($plan->status === $decision && $plan->reviewer_id === $reviewer->id && $plan->reason === $reason) {
                return;
            }

            abort_unless($plan->status === TeachingPlanStatus::Submitted, 409, 'This proposal has already been decided.');
            if ($decision === TeachingPlanStatus::Approved) {
                abort_unless($this->available($shell) && $this->policy->allocated($plan->author_id, $shell)
                    && collect($this->identity($shell))->every(fn ($value, $key) => $value === $plan->snapshot['shell'][$key]), 409,
                    'Shell details, allocation or lessons changed. Reject this snapshot and request a new plan.');
                $this->draftLessons($shell, $plan->snapshot);
            }

            $plan->forceFill([
                'status' => $decision,
                'reviewer_id' => $reviewer->id,
                'reviewed_at' => now(),
                'reason' => $reason,
            ])->save();
        }, 3);
    }

    private function identity(Offering $shell): array
    {
        return $shell->only('external_offering_id', 'curriculum_course_id', 'semester_id', 'section', 'delivery_mode');
    }

    private function draftLessons(Offering $shell, array $snapshot): void
    {
        $lessons = [['title' => $snapshot['title'], 'body' => $snapshot['introduction']], ...$snapshot['weeks']];
        foreach ($lessons as $index => $lesson) {
            Module::forceCreate($lesson + [
                'offering_id' => $shell->id,
                'position' => $index + 1,
                'kind' => ($index === 0 ? LessonKind::Overview : LessonKind::Weekly)->stored(false),
            ]);
        }
    }
}
