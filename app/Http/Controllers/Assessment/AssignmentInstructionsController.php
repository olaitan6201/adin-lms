<?php

namespace App\Http\Controllers\Assessment;

use App\Models\Assignment;
use App\Policies\AssessmentItemPolicy;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class AssignmentInstructionsController
{
    public function __invoke(Request $request, Assignment $assignment, AssessmentItemPolicy $access): Response
    {
        $item = $assignment->item;
        $user = $request->user();
        abort_unless($access->mark($user, $item) || (now()->gte($assignment->opens_at)
            && $access->learner($user, $item->gradebook->offering_id)->exists()), 404);

        return response($assignment->instructions, 200, [
            'Content-Type' => 'text/plain; charset=UTF-8',
            'Content-Disposition' => 'attachment; filename="assignment-instructions.txt"',
            'Cache-Control' => 'private, no-store',
            'X-Content-Type-Options' => 'nosniff',
        ]);
    }
}
