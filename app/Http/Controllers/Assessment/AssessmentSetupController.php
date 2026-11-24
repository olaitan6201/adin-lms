<?php

namespace App\Http\Controllers\Assessment;

use App\Http\Requests\Assessment\GradebookSetupRequest;
use App\Models\AssessmentItem;
use App\Models\Assignment;
use App\Models\AssignmentReference;
use App\Models\Gradebook;
use App\Models\GradeBoundary;
use App\Models\GradingPolicy;
use App\Models\Offering;
use App\Services\Assessment\PrivateScripts;
use Brick\Math\BigDecimal;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\ValidationException;

class AssessmentSetupController
{
    public function book(GradebookSetupRequest $request, Offering $offering): RedirectResponse
    {
        $data = $request->validated();
        DB::transaction(function () use ($data, $offering) {
            Offering::lockForUpdate()->findOrFail($offering->id);
            abort_if(Gradebook::where('offering_id', $offering->id)->exists(), 409);
            $weights = BigDecimal::zero();
            foreach ($data['items'] as $row) {
                $weights = $weights->plus((string) $row['weight']);
            }
            if (! $weights->isEqualTo(100) || ! collect($data['boundaries'])->contains(fn ($r) => BigDecimal::of((string) $r['minimum'])->isZero())) {
                throw ValidationException::withMessages(['items' => 'Weights must total 100 and boundaries must start at zero.']);
            }
            $policy = GradingPolicy::forceCreate(['name' => 'Offering '.$offering->id, 'version' => 1, 'rounding_rule' => $data['rounding']]);
            foreach ($data['boundaries'] as $row) {
                GradeBoundary::forceCreate(['policy_id' => $policy->id, 'minimum_percent' => $row['minimum'], 'grade' => $row['grade']]);
            }
            $book = Gradebook::forceCreate(['policy_id' => $policy->id, 'offering_id' => $offering->id]);
            foreach ($data['items'] as $row) {
                AssessmentItem::forceCreate(['gradebook_id' => $book->id, 'title' => $row['title'], 'kind' => $row['kind'], 'weight_percent' => $row['weight'], 'maximum_score' => $row['maximum'], 'rubric' => ['guide' => $row['rubric'] ?? '']]);
            }
        });

        return back();
    }

    public function assignment(Request $request, AssessmentItem $item, PrivateScripts $files): RedirectResponse
    {
        Gate::authorize('mark', $item);
        abort_unless($item->kind === 'assignment', 422);
        $data = $request->validate(['instructions' => 'required|string|max:30000', 'opens_at' => 'required|date', 'due_at' => 'required|date|after_or_equal:opens_at', 'closes_at' => 'required|date|after_or_equal:due_at', 'formats' => 'required|array|min:1', 'formats.*' => 'required|in:pdf,txt', 'max_bytes' => 'required|integer|between:1,20971520', 'reference' => 'nullable|file|max:20480|mimes:pdf,txt', 'editable' => 'nullable|boolean', 'group_work' => 'nullable|boolean', 'allow_late' => 'nullable|boolean']);
        DB::transaction(function () use ($item, $data, $request, $files) {
            AssessmentItem::lockForUpdate()->findOrFail($item->id);
            abort_if(Assignment::where('item_id', $item->id)->exists(), 409);
            $assignment = Assignment::forceCreate(['item_id' => $item->id, 'instructions' => $data['instructions'], 'opens_at' => $data['opens_at'], 'due_at' => $data['due_at'], 'closes_at' => $data['closes_at'], 'max_bytes' => $data['max_bytes'], 'accepted_formats' => $data['formats'], 'editable' => $request->boolean('editable'), 'group_work' => $request->boolean('group_work'), 'late_policy' => ['allow' => $request->boolean('allow_late')]]);
            if ($request->file('reference')) {
                AssignmentReference::forceCreate(['assignment_id' => $assignment->id, 'file_id' => $files->store($request->file('reference'))->id]);
            }
        });

        return back();
    }
}
