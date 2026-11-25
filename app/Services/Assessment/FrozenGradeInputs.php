<?php

namespace App\Services\Assessment;

use App\Models\Grade;
use App\Models\GradeInput;
use App\Models\GradingPolicyItem;
use Illuminate\Support\Collection;

final class FrozenGradeInputs
{
    public function forGrade(Grade $grade): Collection
    {
        $definitions = GradingPolicyItem::where('policy_id', $grade->policy_id)
            ->get(['assessment_item_id', 'title'])->keyBy('assessment_item_id');
        $inputs = GradeInput::where('grade_id', $grade->id)->with('score.item')->orderBy('id')->get();
        foreach ($inputs as $input) {
            $input->setRelation('definition', $definitions->get($input->score->item_id));
        }

        return $inputs;
    }
}
