<?php

namespace App\Services\Academics;

use App\Enums\DeliveryLinkEvidenceStatus;
use App\Models\Offering;
use App\Models\OfferingCurriculumCourse;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

final class DeliveryLinkRegister
{
    public function __construct(private DeliveryLinkCandidates $candidates) {}

    public function link(User $actor, Offering $offering, string $entryId, string $note): OfferingCurriculumCourse
    {
        $gate = Gate::forUser($actor);
        $gate->authorize('manageDeliveryLinks', Offering::class);

        if (! DeliveryLinkAttestation::valid($note)) {
            throw ValidationException::withMessages([
                'confirmation' => 'Enter a nonblank confirmation of at most '.DeliveryLinkAttestation::MAX_LENGTH.' characters.',
            ]);
        }

        if (! Str::isUuid($entryId)) {
            throw $this->ineligibleAssignment();
        }

        return DB::transaction(function () use ($gate, $actor, $offering, $entryId, $note): OfferingCurriculumCourse {
            $locked = Offering::lockForUpdate()->findOrFail($offering->id);
            $gate->authorize('manageDeliveryLinks', $locked);

            $entry = $this->candidates->findForConfirmation($locked, strtolower($entryId));
            if ($entry === null) {
                throw $this->ineligibleAssignment();
            }

            $keys = ['offering_id' => $locked->id, 'curriculum_course_id' => $entry->id];
            $existing = OfferingCurriculumCourse::where($keys)->lockForUpdate()->first();

            if ($existing !== null) {
                $status = $existing->evidenceStatus();
                if ($status === DeliveryLinkEvidenceStatus::Blocked) {
                    throw ValidationException::withMessages([
                        'assignment' => 'This requirement has incomplete or invalid historical confirmation evidence. Ask the academic records team to review it before retrying.',
                    ]);
                }

                if ($status === DeliveryLinkEvidenceStatus::Confirmed) {
                    return $existing;
                }
            }

            if ($locked->taught_course_revision_id === null) {
                $locked->forceFill(['taught_course_revision_id' => $entry->course_revision_id])->save();
            }

            $evidence = ['linked_by' => $actor->id, 'confirmation_note' => $note, 'confirmed_at' => now()];
            if ($existing !== null) {
                $existing->fill($evidence)->save();

                return $existing;
            }

            return OfferingCurriculumCourse::create($keys + $evidence);
        }, 3);
    }

    private function ineligibleAssignment(): ValidationException
    {
        return ValidationException::withMessages([
            'assignment' => 'Choose an approved requirement for the course and exact revision taught in this published offering.',
        ]);
    }
}
