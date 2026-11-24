<?php

namespace App\Http\Controllers;

use App\Enums\EnrolmentStatus;
use App\Http\Resources\RosterMemberResource;
use App\Models\Offering;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Gate;

class OfferingRosterController extends Controller
{
    /**
     * Handle the incoming request.
     */
    public function __invoke(Offering $offering): AnonymousResourceCollection
    {
        Gate::authorize('viewRoster', $offering);

        return RosterMemberResource::collection($offering->enrolments()
            ->where('status', EnrolmentStatus::Registered)->with('student.user:id,full_name')
            ->orderBy('student_id')->simplePaginate(50));
    }
}
