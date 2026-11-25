<?php

namespace App\Http\Controllers\Academics;

use App\Enums\CurriculumStatus;
use App\Http\Requests\OfferingPreparationRequest;
use App\Models\Offering;
use App\Services\Academics\OfferingLifecycle;
use App\Services\Authority\ScopedAuthority;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class OfferingDeliveryController
{
    public function index(Request $request, ScopedAuthority $authority): Response
    {
        abort_unless($authority->institutionAllows($request->user(), 'offerings.manage'), 403);

        return Inertia::render('Academics/Delivery', [
            'offerings' => DB::table('offerings')
                ->orderBy('external_offering_id')
                ->get([
                    'id',
                    'external_offering_id',
                    'status',
                    'curriculum_course_id',
                    'semester_id',
                    'section',
                    'delivery_mode',
                    'copied_from',
                ]),
            'entries' => DB::table('curriculum_courses as c')
                ->join('curricula', 'curricula.id', '=', 'c.curriculum_id')
                ->join('courses', 'courses.id', '=', 'c.course_id')
                ->join('programmes', 'programmes.id', '=', 'curricula.programme_id')
                ->where('curricula.status', CurriculumStatus::Approved->value)
                ->orderBy('courses.code')
                ->get(['c.id', 'c.title', 'courses.code', 'curricula.version', 'programmes.name']),
            'terms' => DB::table('semesters')
                ->join('academic_sessions', 'session_id', '=', 'academic_sessions.id')
                ->orderByDesc('semesters.starts_on')
                ->get(['semesters.id', 'academic_sessions.label', 'semesters.position']),
            'modes' => OfferingLifecycle::MODES,
        ]);
    }

    public function change(
        OfferingPreparationRequest $request,
        OfferingLifecycle $lifecycle,
        Offering $offering,
        string $action,
    ): RedirectResponse {
        $lifecycle->change($offering, $action, $request->validated(), $request->user());

        return to_route('academics.delivery');
    }
}
