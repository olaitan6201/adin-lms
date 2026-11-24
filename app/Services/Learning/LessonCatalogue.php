<?php

namespace App\Services\Learning;

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
        $lessons = Module::where('offering_id', $offering->id)->orderBy('position')->get()
            ->filter(fn ($m) => $staff || $this->policy->released($m));
        $materials = LearningMaterial::whereIn('module_id', $lessons->modelKeys())->orderBy('id')->get()
            ->filter(fn ($m) => $staff || $this->policy->released($m));
        $versions = MaterialVersion::with(['file:id,media_type', 'createdBy:id,full_name'])->whereIn('material_id', $materials->modelKeys())->orderByDesc('revision')->get()->groupBy('material_id');
        $materials = $materials->groupBy('module_id');
        $progress = $enrolment ? LessonProgress::where('enrolment_id', $enrolment->id)->pluck('completed_at', 'module_id') : collect();

        return $lessons->values()->map(function ($lesson) use ($materials, $versions, $progress, $staff, $offering) {
            $items = $materials->get($lesson->id, collect())->map(function ($item) use ($versions, $staff, $offering) {
                $history = $versions->get($item->id, collect());

                return [...$item->only(['id', 'title', 'download_allowed', 'opens_at', 'closes_at']), 'versions' => ($staff ? $history : $history->take(1))->values()->map(fn ($v) => [
                    'author' => $staff ? $v->createdBy->full_name : null,
                    'image' => ($staff || $item->download_allowed) && in_array($v->file?->media_type, PrivateUpload::INLINE_IMAGES, true)
                        ? route('learning.download', [$offering, $v, 'preview' => 1]) : null,
                    ...$v->only(['revision', 'external_url', 'body']), 'download' => $v->file_id && ($staff || $item->download_allowed) ? route('learning.download', [$offering, $v]) : null,
                ])];
            });

            return [...$lesson->only(['id', 'kind', 'position', 'title', 'body', 'opens_at', 'closes_at']), 'completed_at' => $progress->get($lesson->id), 'materials' => $items->values()];
        });
    }
}
