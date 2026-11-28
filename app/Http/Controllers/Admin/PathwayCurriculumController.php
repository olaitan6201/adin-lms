<?php

namespace App\Http\Controllers\Admin;

use App\Enums\PathwayCurriculumAuditAction;
use App\Http\Requests\Admin\EditPathwayCurriculumGraphRequest;
use App\Http\Requests\Admin\PathwayCurriculumApprovalRequest;
use App\Http\Requests\Admin\PathwayCurriculumEditRequest;
use App\Http\Requests\Admin\StoreCurriculumAssignmentRequest;
use App\Http\Requests\Admin\StoreCurriculumChoiceRequest;
use App\Http\Requests\Admin\StorePathwayCurriculumRequest;
use App\Models\Curriculum;
use App\Services\Academics\PathwayCurriculumEditing;
use App\Services\Academics\PathwayCurriculumWorkflow;
use Illuminate\Http\RedirectResponse;

final class PathwayCurriculumController
{
    public function __construct(
        private PathwayCurriculumWorkflow $workflow,
        private PathwayCurriculumEditing $editing,
    ) {}

    public function store(StorePathwayCurriculumRequest $request): RedirectResponse
    {
        return $this->selected($this->workflow->create(
            $request->user(),
            $request->validated('academic_pathway_id'),
            $request->validated('framework_revision'),
        ));
    }

    public function assignment(StoreCurriculumAssignmentRequest $request, string $curriculum): RedirectResponse
    {
        return $this->selected($this->editing->assignment($request->user(), $curriculum, $request->validated()));
    }

    public function updateAssignment(StoreCurriculumAssignmentRequest $request, string $curriculum, string $entry): RedirectResponse
    {
        return $this->selected($this->editing->updateAssignment($request->user(), $curriculum, $entry, $request->validated()));
    }

    public function choice(StoreCurriculumChoiceRequest $request, string $curriculum): RedirectResponse
    {
        return $this->selected($this->editing->choice($request->user(), $curriculum, $request->validated()));
    }

    public function prerequisite(EditPathwayCurriculumGraphRequest $request, string $curriculum): RedirectResponse
    {
        return $this->editGraph($request, $curriculum, PathwayCurriculumAuditAction::PrerequisiteAdded);
    }

    public function courseOutcome(EditPathwayCurriculumGraphRequest $request, string $curriculum): RedirectResponse
    {
        return $this->editGraph($request, $curriculum, PathwayCurriculumAuditAction::CourseOutcomeAdded);
    }

    public function programmeOutcome(EditPathwayCurriculumGraphRequest $request, string $curriculum): RedirectResponse
    {
        return $this->editGraph($request, $curriculum, PathwayCurriculumAuditAction::ProgrammeOutcomeAdded);
    }

    public function mapping(EditPathwayCurriculumGraphRequest $request, string $curriculum): RedirectResponse
    {
        return $this->editGraph($request, $curriculum, PathwayCurriculumAuditAction::OutcomeMapped);
    }

    public function review(PathwayCurriculumEditRequest $request, string $curriculum): RedirectResponse
    {
        return $this->selected($this->workflow->review($request->user(), $curriculum));
    }

    public function approve(PathwayCurriculumApprovalRequest $request, string $curriculum): RedirectResponse
    {
        return $this->selected($this->workflow->approve($request->user(), $curriculum));
    }

    public function fork(PathwayCurriculumEditRequest $request, string $curriculum): RedirectResponse
    {
        return $this->selected($this->workflow->fork($request->user(), $curriculum));
    }

    private function editGraph(
        EditPathwayCurriculumGraphRequest $request,
        string $curriculum,
        PathwayCurriculumAuditAction $action,
    ): RedirectResponse {
        return $this->selected($this->editing->graph($request->user(), $curriculum, $action, $request->validated()));
    }

    private function selected(Curriculum $curriculum): RedirectResponse
    {
        return to_route('admin.academic-core', ['curriculum' => $curriculum->id]);
    }
}
