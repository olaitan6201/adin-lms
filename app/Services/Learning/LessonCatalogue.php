<?php

namespace App\Services\Learning;

use App\Enums\Learning\LessonKind;
use App\Http\Resources\Learning\MaterialResource;
use App\Models\Enrolment;
use App\Models\LearningMaterial;
use App\Models\LessonProgress;
use App\Models\MaterialVersion;
use App\Models\Module;
use App\Models\Offering;
use App\Policies\LearningPolicy;
use Illuminate\Support\Collection;

final class LessonCatalogue
{
    public function __construct(private LearningPolicy $policy) {}

    public function lessons(Offering $offering, bool $staff, ?Enrolment $enrolment): Collection
    {
        $lessons = Module::where('offering_id', $offering->id)
            ->orderBy('position')
            ->get()
            ->filter(fn ($m) => $staff || $this->policy->released($m));
        $unlocked = $staff ? $lessons->pluck('id')->flip() : LessonAccess::unlocked($enrolment?->student->user_id)
            ->where('lesson.offering_id', $offering->id)->pluck('lesson.id')->flip();
        $titles = $lessons->pluck('title', 'id');
        $materials = LearningMaterial::whereIn('module_id', $unlocked->keys())
            ->orderBy('id')
            ->get()
            ->filter(fn ($m) => $staff || $this->policy->released($m));
        $versions = MaterialVersion::with(['file:id,media_type', 'createdBy:id,full_name'])
            ->whereIn('material_id', $materials->modelKeys())
            ->orderByDesc('revision')
            ->get()
            ->groupBy('material_id');
        $materials = $materials->groupBy('module_id');
        $progress = $enrolment
            ? LessonProgress::where('enrolment_id', $enrolment->id)->pluck('completed_at', 'module_id')
            : collect();

        return $lessons
            ->values()
            ->map(function ($lesson) use ($materials, $versions, $progress, $staff, $offering, $unlocked, $titles) {
                $items = $materials
                    ->get($lesson->id, collect())
                    ->map(function ($item) use ($versions, $staff, $offering) {
                        $history = $versions->get($item->id, collect());

                        return new MaterialResource($item, $history, $offering, $staff)->resolve();
                    });

                return [
                    ...$lesson->only(['id', 'position', 'title', 'opens_at', 'closes_at']),
                    'body' => $unlocked->has($lesson->id) ? $lesson->body : null,
                    'locked' => ! $unlocked->has($lesson->id),
                    'prerequisite_id' => $titles->has($lesson->prerequisite_id) ? $lesson->prerequisite_id : null,
                    'published' => ! str_starts_with($lesson->kind, LessonKind::DRAFT_PREFIX),
                    'kind' => str($lesson->kind)->after(LessonKind::DRAFT_PREFIX)->toString(),
                    'completed_at' => $progress->get($lesson->id),
                    'materials' => $items->values(),
                ];
            });
    }
}
