<?php

namespace App\Services\Assessment;

use App\Enums\Assessment\AssessmentEvent;
use App\Models\AssessmentItem;
use App\Models\AssessmentScore;
use App\Models\Examination;
use App\Models\ExamSlot;
use App\Models\Gradebook;
use App\Models\GradeBoundary;
use App\Models\GradingPolicy;
use App\Models\GradingPolicyItem;
use App\Models\Offering;
use App\Models\User;
use Brick\Math\BigDecimal;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class ActivateGradebook
{
    public function __construct(
        private GradebookPolicyAccess $access,
        private ScoreLedger $ledger,
    ) {}

    public function run(Offering $offering, array $data, ?User $actor = null): void
    {
        $actor ??= Auth::user();
        DB::transaction(function () use ($actor, $data, $offering): void {
            $offering = Offering::lockForUpdate()->findOrFail($offering->id);
            $book = Gradebook::where('offering_id', $offering->id)->lockForUpdate()->first();
            $this->access->assertAllows($actor, $offering, $book);
            $policy = AssessmentPolicy::normalize($data);
            if ($book === null) {
                $this->activate($offering, $policy, $actor);
            } else {
                $this->amend($offering, $book, $policy, $data['reason'] ?? '', $actor);
            }
        }, 3);
    }

    private function activate(Offering $offering, array $data, User $actor): void
    {
        if (collect($data['items'])->contains(fn (array $item): bool => $item['id'] !== null)) {
            throw ValidationException::withMessages(['items' => 'A new gradebook cannot reference existing items.']);
        }

        $policy = $this->createPolicy($offering, $data, null, $actor, 'Offering '.$offering->id);
        $book = Gradebook::forceCreate(['offering_id' => $offering->id, 'policy_id' => $policy->id]);
        foreach ($data['items'] as $position => $row) {
            $item = $this->createItem($book, $row);
            $this->snapshot($policy, $item, $row, $position);
        }

        $this->ledger->audit(AssessmentEvent::GradebookActivated, $book->id, $actor->id, [
            'policy_id' => $policy->id,
            'version' => $policy->version,
        ]);
    }

    private function amend(Offering $offering, Gradebook $book, array $data, string $reason, User $actor): void
    {
        if (blank($reason)) {
            throw ValidationException::withMessages(['reason' => 'Explain why the approved policy is being amended.']);
        }

        $previous = GradingPolicy::lockForUpdate()->findOrFail($book->policy_id);
        $items = AssessmentItem::where('gradebook_id', $book->id)->lockForUpdate()->get()->keyBy('id');
        $ids = collect($data['items'])->pluck('id')->filter()->values();
        if ($ids->duplicates()->isNotEmpty()
            || $items->keys()->diff($ids)->isNotEmpty()
            || $ids->diff($items->keys())->isNotEmpty()) {
            throw ValidationException::withMessages(['items' => 'Include every current item exactly once.']);
        }

        $name = $previous->offering_id === $offering->id ? $previous->name : 'Offering '.$offering->id;
        $policy = $this->createPolicy($offering, $data, $previous, $actor, $name, $reason);
        foreach ($data['items'] as $position => $row) {
            $item = $items->get($row['id']);
            if ($item === null) {
                $item = $this->createItem($book, $row);
            } else {
                $this->assertCompatible($item, $row);
                $item->forceFill($this->attributes($row))->save();
            }

            $this->snapshot($policy, $item, $row, $position);
        }

        $book->forceFill(['policy_id' => $policy->id])->save();
        $this->ledger->audit(AssessmentEvent::PolicyAmended, $book->id, $actor->id, [
            'previous_policy_id' => $previous->id,
            'policy_id' => $policy->id,
            'version' => $policy->version,
            'reason' => $reason,
        ]);
    }

    private function createPolicy(
        Offering $offering,
        array $data,
        ?GradingPolicy $previous,
        User $actor,
        string $name,
        ?string $reason = null,
    ): GradingPolicy {
        $version = 1 + max((int) $previous?->version, (int) GradingPolicy::where('name', $name)->max('version'));
        $policy = GradingPolicy::forceCreate([
            'name' => $name,
            'version' => $version,
            'rounding_rule' => $data['rounding']->value,
            'offering_id' => $offering->id,
            'supersedes_id' => $previous?->id,
            'created_by' => $actor->id,
            'created_at' => now(),
            'amendment_reason' => $reason,
        ]);
        foreach ($data['boundaries'] as $boundary) {
            GradeBoundary::forceCreate([
                'policy_id' => $policy->id,
                'minimum_percent' => $boundary['minimum'],
                'grade' => $boundary['grade'],
            ]);
        }

        return $policy;
    }

    private function createItem(Gradebook $book, array $row): AssessmentItem
    {
        return AssessmentItem::forceCreate(['gradebook_id' => $book->id] + $this->attributes($row));
    }

    private function attributes(array $row): array
    {
        return [
            'title' => $row['title'],
            'kind' => $row['kind']->value,
            'weight_percent' => $row['weight_percent'],
            'maximum_score' => $row['maximum_score'],
            'rubric' => $row['rubric'],
        ];
    }

    private function assertCompatible(AssessmentItem $item, array $row): void
    {
        $changesMaximum = ! BigDecimal::of((string) $item->maximum_score)->isEqualTo($row['maximum_score']);
        $hasScores = AssessmentScore::where('item_id', $item->id)->exists();
        $exam = Examination::where('item_id', $item->id)->first();
        $hasSlotMaxima = $exam !== null && ExamSlot::where('exam_id', $exam->id)->exists();
        if ($item->kind !== $row['kind'] || ($changesMaximum && ($hasScores || $hasSlotMaxima))) {
            throw ValidationException::withMessages(['items' => 'An item cannot change kind or its scored/configured maximum.']);
        }
    }

    private function snapshot(GradingPolicy $policy, AssessmentItem $item, array $row, int $position): void
    {
        GradingPolicyItem::forceCreate([
            'policy_id' => $policy->id,
            'assessment_item_id' => $item->id,
            'position' => $position,
        ] + $this->attributes($row));
    }
}
