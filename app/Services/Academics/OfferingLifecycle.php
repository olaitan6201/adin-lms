<?php

namespace App\Services\Academics;

use App\Enums\CurriculumStatus;
use App\Enums\OfferingStatus;
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
                    'prepare', 'copy', 'publish' => [OfferingStatus::Draft, OfferingStatus::Unpublished],
                    'unpublish' => [OfferingStatus::Published],
                    'archive' => [
                        OfferingStatus::Published,
                        OfferingStatus::Unpublished,
                        OfferingStatus::Draft,
                    ],
                };
                if (! in_array($offering->status, $allowed, true)) {
                    throw ValidationException::withMessages([
                        'status' => 'This action is unavailable in the current state.',
                    ]);
                }

                if ($action === 'prepare') {
                    $entry = CurriculumCourse::findOrFail($data['curriculum_course_id']);
                    if ($entry->curriculum->status !== CurriculumStatus::Approved) {
                        throw ValidationException::withMessages([
                            'curriculum_course_id' => 'Select an approved curriculum course.',
                        ]);
                    }

                    $offering->forceFill($data);
                } elseif ($action === 'copy') {
                    app(DeliveryCopy::class)->into($offering, $data['source_id']);
                } elseif ($action === 'publish') {
                    if (
                        ! $offering->external_offering_id ||
                        ! $offering->section ||
                        ! $offering->semester_id ||
                        ! in_array($offering->delivery_mode, self::MODES, true) ||
                        $offering->curriculumCourse?->curriculum?->status !== CurriculumStatus::Approved ||
                        ! TeachingAllocation::where('offering_id', $offering->id)->exists()
                    ) {
                        throw ValidationException::withMessages([
                            'status' => 'Complete academic details and assign a lecturer before publishing.',
                        ]);
                    }

                    $offering->forceFill([
                        'status' => OfferingStatus::Published,
                        'approved_at' => now(),
                        'approved_by' => $actor->id,
                    ]);
                } else {
                    $offering->status =
                        $action === 'archive' ? OfferingStatus::Archived : OfferingStatus::Unpublished;
                }

                $offering->save();
            }, 3);
        } catch (UniqueConstraintViolationException $error) {
            if ($action !== 'prepare') {
                throw $error;
            }

            throw ValidationException::withMessages([
                'section' => 'This course section already exists in the selected semester.',
            ]);
        }
    }
}
