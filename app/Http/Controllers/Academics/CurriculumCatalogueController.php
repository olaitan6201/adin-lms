<?php

namespace App\Http\Controllers\Academics;

use App\Http\Requests\CreateCurriculumRequest;
use App\Http\Requests\CurriculumEntryRequest;
use App\Models\Curriculum;
use App\Services\Academics\CurriculumVersioning;
use App\Services\Authority\ScopedAuthority;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class CurriculumCatalogueController
{
    public function index(Request $request, ScopedAuthority $authority, ?Curriculum $version = null): Response
    {
        $user = $request->user();
        $edit = $authority->institutionAllows($user, 'curriculum.edit');
        $approve = $authority->institutionAllows($user, 'curriculum.approve');
        abort_unless($edit || $approve || $authority->institutionAllows($user, 'compliance.read'), 403);
        $entries = DB::table('curriculum_courses')
            ->join('courses', 'courses.id', '=', 'course_id')
            ->where('curriculum_id', $version?->id)
            ->orderBy('courses.code')
            ->get(['curriculum_courses.*', 'courses.code']);
        $courseOutcomes = DB::table('course_outcomes')
            ->whereIn('curriculum_course_id', $entries->pluck('id'))
            ->get();
        $programmeOutcomes = DB::table('programme_outcomes')->where('curriculum_id', $version?->id)->get();

        return Inertia::render(
            'Academics/Catalogue',
            compact('edit', 'approve', 'version', 'entries', 'courseOutcomes', 'programmeOutcomes') + [
                'mappings' => DB::table('outcome_mappings')
                    ->whereIn('course_outcome_id', $courseOutcomes->pluck('id'))
                    ->get(),
                'prerequisites' => DB::table('prerequisites')
                    ->whereIn('curriculum_course_id', $entries->pluck('id'))
                    ->get(),
                'programmes' => DB::table('programmes')
                    ->orderBy('name')
                    ->get(['id', 'name']),
                'versions' => DB::table('curricula')
                    ->join('programmes', 'programme_id', '=', 'programmes.id')
                    ->orderBy('programmes.name')
                    ->orderByDesc('version')
                    ->get(['curricula.id', 'programmes.name', 'version', 'status']),
                'levels' => DB::table('academic_levels')
                    ->orderBy('label')
                    ->get(['id', 'label as name']),
            ],
        );
    }

    public function store(CreateCurriculumRequest $request, CurriculumVersioning $versions): RedirectResponse
    {
        $draft = $versions->create(
            $request->validated('programme_id'),
            $request->validated('framework_revision'),
        );

        return to_route('academics.curriculum.show', $draft);
    }

    public function change(
        CurriculumEntryRequest $request,
        CurriculumVersioning $versions,
        string $version,
        string $action,
    ): RedirectResponse {
        return to_route(
            'academics.curriculum.show',
            $versions->change($version, $action, $request->validated(), $request->user()),
        );
    }
}
