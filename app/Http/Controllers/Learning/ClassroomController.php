<?php

namespace App\Http\Controllers\Learning;

use App\Http\Requests\Learning\ClassRequest;
use App\Models\ClassSession;
use App\Models\LearningMaterial;
use App\Models\Offering;
use App\Policies\LearningPolicy;
use App\Services\Learning\ClassroomWorkspace;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

final class ClassroomController
{
    public function index(
        Request $request,
        Offering $offering,
        LearningPolicy $policy,
        ClassroomWorkspace $workspace,
    ): Response {
        $staff = $policy->audience($request->user(), $offering);

        return Inertia::render(
            'Learning/Classroom',
            $workspace->props($offering, $request->user(), $staff),
        );
    }

    public function save(
        ClassRequest $request,
        Offering $offering,
        ?ClassSession $session = null,
    ): RedirectResponse {
        abort_if($session && $session->offering_id !== $offering->id, 404);
        if (
            $request->filled('recording_material_id') &&
            ! LearningMaterial::whereKey($request->validated('recording_material_id'))
                ->whereHas('module', fn ($m) => $m->where('offering_id', $offering->id))
                ->exists()
        ) {
            throw ValidationException::withMessages([
                'recording_material_id' => 'Choose a resource from this offering.',
            ]);
        }
        ($session ?? new ClassSession)
            ->forceFill([
                ...$request->validated(),
                'starts_at' => $request->date('starts_at')->utc(),
                'ends_at' => $request->date('ends_at')->utc(),
                'offering_id' => $offering->id,
            ])
            ->save();

        return to_route('learning.classes', $offering);
    }
}
