<?php

namespace App\Http\Controllers\Assessment;

use App\Enums\Assessment\ItemKind;
use App\Http\Requests\Assessment\AssignmentSetupRequest;
use App\Http\Requests\Assessment\GradebookSetupRequest;
use App\Models\AssessmentItem;
use App\Models\Offering;
use App\Services\Assessment\ActivateGradebook;
use App\Services\Assessment\ConfigureAssignment;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Gate;

class AssessmentSetupController
{
    public function book(
        GradebookSetupRequest $request,
        Offering $offering,
        ActivateGradebook $action,
    ): RedirectResponse {
        $action->run($offering, $request->validated());

        return back();
    }

    public function assignment(
        AssignmentSetupRequest $request,
        AssessmentItem $item,
        ConfigureAssignment $action,
    ): RedirectResponse {
        Gate::authorize('mark', $item);
        abort_unless($item->kind === ItemKind::Assignment, 422);
        $action->run($item, $request->validated(), $request->file('reference'));

        return back();
    }
}
