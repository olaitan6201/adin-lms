<?php

namespace App\Services\Academics;

use App\Models\CurriculumCourse;
use App\Models\Offering;
use App\Models\TeachingAllocation;
use App\Models\User;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class OfferingLifecycle
{
    public const MODES = ['online', 'blended', 'face-to-face'];

    public function change(Offering $offering, string $action, array $data, User $actor): void
    {
        try {
            DB::transaction(function () use ($offering, $action, $data, $actor) {
                $offering = Offering::lockForUpdate()->findOrFail($offering->id);
                $allowed = match ($action) {
                    'prepare', 'copy', 'publish' => ['draft', 'unpublished'], 'unpublish' => ['published'], 'archive' => ['published', 'unpublished', 'draft'],
                };
                if (! in_array($offering->status, $allowed, true)) {
                    throw ValidationException::withMessages(['status' => 'This action is unavailable in the current state.']);
                }
                if ($action === 'prepare') {
                    $entry = CurriculumCourse::findOrFail($data['curriculum_course_id']);
                    if ($entry->curriculum->status !== 'approved') {
                        throw ValidationException::withMessages(['curriculum_course_id' => 'Select an approved curriculum course.']);
                    }
                    $offering->forceFill($data);
                } elseif ($action === 'copy') {
                    app(DeliveryCopy::class)->into($offering, $data['source_id']);
                } elseif ($action === 'publish') {
                    if (! $offering->external_offering_id || ! $offering->section || ! $offering->semester_id || ! in_array($offering->delivery_mode, self::MODES, true)
                        || $offering->curriculumCourse?->curriculum?->status !== 'approved' || ! TeachingAllocation::where('offering_id', $offering->id)->exists()) {
                        throw ValidationException::withMessages(['status' => 'Complete academic details and assign a lecturer before publishing.']);
                    }
                    $offering->forceFill(['status' => 'published', 'approved_at' => now(), 'approved_by' => $actor->id]);
                } else {
                    $offering->status = $action === 'archive' ? 'archived' : 'unpublished';
                }
                $offering->save();
            }, 3);
        } catch (UniqueConstraintViolationException $error) {
            if ($action !== 'prepare') {
                throw $error;
            }
            throw ValidationException::withMessages(['section' => 'This course section already exists in the selected semester.']);
        }
    }
}
