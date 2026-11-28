<?php

namespace App\Services\Academics;

use App\Enums\CurriculumStatus;
use App\Enums\OfferingDeliveryMode;
use App\Enums\OfferingLifecycleAction;
use App\Enums\OfferingStatus;
use App\Models\CurriculumCourse;
use App\Models\Offering;
use App\Models\TeachingAllocation;
use App\Models\User;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

/**
 * @phpstan-type Preparation array{
 *     curriculum_course_id: string, semester_id: string, section: string, delivery_mode: value-of<OfferingDeliveryMode>
 * }
 * @phpstan-type CopySource array{source_id: string}
 */
class OfferingLifecycle
{
    public const MODES = [
        OfferingDeliveryMode::Online->value,
        OfferingDeliveryMode::Blended->value,
        OfferingDeliveryMode::FaceToFace->value,
    ];

    public function __construct(private DeliveryCopy $copy) {}

    /**
     * @param  'prepare'|'copy'|'publish'|'unpublish'|'archive'  $action
     * @param  ($action is 'prepare' ? Preparation : ($action is 'copy' ? CopySource : array{}))  $data
     */
    public function change(Offering $offering, string $action, array $data, User $actor): void
    {
        $operation = OfferingLifecycleAction::from($action);

        try {
            DB::transaction(function () use ($offering, $operation, $data, $actor): void {
                $locked = Offering::lockForUpdate()->findOrFail($offering->id);

                if (! $operation->allows($locked->status)) {
                    throw ValidationException::withMessages([
                        'status' => 'This action is unavailable in the current state.',
                    ]);
                }

                switch ($operation) {
                    case OfferingLifecycleAction::Prepare:
                        $this->prepare($locked, $data);
                        break;
                    case OfferingLifecycleAction::Copy:
                        $this->copy->into($locked, $data['source_id']);
                        break;
                    case OfferingLifecycleAction::Publish:
                        $this->publish($locked, $actor);
                        break;
                    case OfferingLifecycleAction::Archive:
                        $locked->status = OfferingStatus::Archived;
                        break;
                    case OfferingLifecycleAction::Unpublish:
                        $locked->status = OfferingStatus::Unpublished;
                        break;
                }

                $locked->save();
            }, 3);
        } catch (UniqueConstraintViolationException $error) {
            if ($operation !== OfferingLifecycleAction::Prepare) {
                throw $error;
            }

            throw ValidationException::withMessages([
                'section' => 'This course section already exists in the selected semester.',
            ]);
        }
    }

    /** @param Preparation $data */
    private function prepare(Offering $offering, array $data): void
    {
        if ($offering->taught_course_revision_id !== null && (
            $data['curriculum_course_id'] !== $offering->curriculum_course_id
            || $data['semester_id'] !== $offering->semester_id
            || $data['section'] !== $offering->section
        )) {
            throw ValidationException::withMessages([
                'status' => 'This offering has a recorded course revision. Its course, term and section cannot change.',
            ]);
        }

        $entry = CurriculumCourse::findOrFail($data['curriculum_course_id']);
        if (! $this->isApprovedLegacyEntry($entry)) {
            throw ValidationException::withMessages([
                'curriculum_course_id' => 'Select an approved curriculum course.',
            ]);
        }

        $offering->forceFill([
            'curriculum_course_id' => $data['curriculum_course_id'],
            'semester_id' => $data['semester_id'],
            'section' => $data['section'],
            'delivery_mode' => $data['delivery_mode'],
        ]);
    }

    private function publish(Offering $offering, User $actor): void
    {
        if (! $offering->external_offering_id
            || ! $offering->section
            || ! $offering->semester_id
            || ! in_array($offering->delivery_mode, self::MODES, true)
            || ! $this->isApprovedLegacyEntry($offering->curriculumCourse)
            || ! TeachingAllocation::where('offering_id', $offering->id)->exists()) {
            throw ValidationException::withMessages([
                'status' => 'Complete academic details and assign a lecturer before publishing.',
            ]);
        }

        $offering->forceFill([
            'status' => OfferingStatus::Published,
            'approved_at' => now(),
            'approved_by' => $actor->id,
        ]);
    }

    private function isApprovedLegacyEntry(?CurriculumCourse $entry): bool
    {
        return $entry !== null
            && $entry->course_revision_id === null
            && $entry->curriculum->academic_pathway_id === null
            && $entry->curriculum->status === CurriculumStatus::Approved;
    }
}
