<?php

namespace App\Http\Controllers\Assessment;

use App\Models\Offering;
use App\Policies\AssessmentItemPolicy;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ExaminationsOfficeController
{
    public function __invoke(Request $request, AssessmentItemPolicy $access): Response
    {
        abort_unless($access->examOfficer($request->user()), 403);
        $offerings = Offering::with('curriculumCourse:id,title')->orderBy('external_offering_id')
            ->simplePaginate(30, ['id', 'external_offering_id', 'curriculum_course_id'])
            ->through(fn ($offering) => [
                'code' => $offering->external_offering_id,
                'title' => $offering->curriculumCourse?->title,
                'href' => route('assessment.desk', $offering, false),
            ]);

        return Inertia::render('Assessments/Office', ['offerings' => $offerings]);
    }
}
