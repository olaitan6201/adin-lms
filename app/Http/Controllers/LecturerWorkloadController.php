<?php

namespace App\Http\Controllers;

use App\Models\Offering;
use App\Services\Lecturer\LecturerWorkloadService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class LecturerWorkloadController extends Controller
{
    public function index(Request $request, LecturerWorkloadService $workload): Response
    {
        abort_unless($request->user()->lecturer !== null, 403);
        $termId = $request->query('term');
        abort_unless($termId === null || is_string($termId), 404);

        return Inertia::render('Workload', [
            'report' => null,
            'workload' => $workload->forUser($request->user(), $termId === '' ? null : $termId),
        ]);
    }

    public function show(Request $request, Offering $offering, LecturerWorkloadService $workload): Response
    {
        Gate::authorize('viewRoster', $offering);
        abort_unless($workload->isAllocatedTo($request->user(), $offering), 403);

        return Inertia::render('Workload', [
            'report' => $workload->classReport($request->user(), $offering),
        ]);
    }
}
