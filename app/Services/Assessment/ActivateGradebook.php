<?php

namespace App\Services\Assessment;

use App\Models\AssessmentItem;
use App\Models\Gradebook;
use App\Models\GradeBoundary;
use App\Models\GradingPolicy;
use App\Models\Offering;
use Brick\Math\BigDecimal;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class ActivateGradebook
{
    public function run(Offering $offering, array $data): void
    {
        DB::transaction(function () use ($data, $offering) {
            Offering::lockForUpdate()->findOrFail($offering->id);
            abort_if(Gradebook::where('offering_id', $offering->id)->exists(), 409);
            $weights = BigDecimal::zero();
            foreach ($data['items'] as $row) {
                $weights = $weights->plus((string) $row['weight']);
            }

            $coversZero = collect($data['boundaries'])->contains(fn ($row) => BigDecimal::of((string) $row['minimum'])->isZero());

            if (! $weights->isEqualTo(100) || ! $coversZero) {
                throw ValidationException::withMessages(['items' => 'Weights must total 100 and boundaries must start at zero.']);
            }

            $policy = GradingPolicy::forceCreate([
                'name' => 'Offering '.$offering->id,
                'version' => 1,
                'rounding_rule' => $data['rounding'],
            ]);
            foreach ($data['boundaries'] as $row) {
                GradeBoundary::forceCreate([
                    'policy_id' => $policy->id,
                    'minimum_percent' => $row['minimum'],
                    'grade' => $row['grade'],
                ]);
            }

            $book = Gradebook::forceCreate([
                'policy_id' => $policy->id,
                'offering_id' => $offering->id,
            ]);
            foreach ($data['items'] as $row) {
                AssessmentItem::forceCreate([
                    'gradebook_id' => $book->id,
                    'title' => $row['title'],
                    'kind' => $row['kind'],
                    'weight_percent' => $row['weight'],
                    'maximum_score' => $row['maximum'],
                    'rubric' => ['guide' => $row['rubric'] ?? ''],
                ]);
            }
        });
    }
}
