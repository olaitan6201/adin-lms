<?php

namespace App\Services\Assessment;

use App\Models\AssessmentItem;
use App\Models\AssessmentScore;
use App\Models\Enrolment;
use App\Models\Grade;
use App\Models\Gradebook;
use App\Models\GradeBoundary;
use App\Models\GradeInput;
use App\Models\User;
use Brick\Math\BigRational;
use Brick\Math\RoundingMode;
use Illuminate\Support\Facades\DB;

class GradeCalculation
{
    public function compute(Gradebook $book, Enrolment $enrolment, User $user): Grade
    {
        return DB::transaction(function () use ($book, $enrolment, $user) {
            Enrolment::where('offering_id', $book->offering_id)->lockForUpdate()->findOrFail($enrolment->id);
            $total = BigRational::zero();
            $weights = BigRational::zero();
            $inputs = [];
            foreach (AssessmentItem::where('gradebook_id', $book->id)->get() as $item) {
                $score = AssessmentScore::where('item_id', $item->id)->where('enrolment_id', $enrolment->id)->latest('revision')->first();
                abort_unless($score, 422, 'Every item needs a recorded mark.');
                $weights = $weights->plus((string) $item->weight_percent);
                $total = $total->plus(BigRational::of((string) $score->points)->multipliedBy((string) $item->weight_percent)->dividedBy((string) $item->maximum_score))->simplified();
                $inputs[] = ['score_id' => $score->id, 'maximum_score' => $item->maximum_score, 'applied_weight' => $item->weight_percent];
            }
            abort_unless($weights->isEqualTo(100), 422, 'Weights must total 100%.');
            $mode = match ($book->policy->rounding_rule) {
                'half_up' => RoundingMode::HalfUp,'half_even' => RoundingMode::HalfEven,'floor' => RoundingMode::Floor,default => abort(422, 'Unsupported rounding rule.')
            };
            $percent = (string) $total->toScale(2, $mode);
            $label = GradeBoundary::where('policy_id', $book->policy_id)->where('minimum_percent', '<=', $percent)->orderByDesc('minimum_percent')->value('grade');
            abort_unless($label !== null, 422, 'No matching grade boundary.');
            $grade = Grade::forceCreate(['enrolment_id' => $enrolment->id, 'policy_id' => $book->policy_id, 'revision' => 1 + Grade::where('enrolment_id', $enrolment->id)->max('revision'), 'total_percent' => $percent, 'grade' => $label]);
            foreach ($inputs as $input) {
                GradeInput::forceCreate(['grade_id' => $grade->id] + $input);
            }
            app(ScoreLedger::class)->audit('grade.calculated', $grade->id, $user->id);

            return $grade;
        }, 3);
    }
}
