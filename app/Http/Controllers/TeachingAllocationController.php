<?php

namespace App\Http\Controllers;

use App\Http\Requests\ChangeTeachingAllocationRequest;
use App\Models\AuditLog;
use App\Models\Lecturer;
use App\Models\Offering;
use App\Models\TeachingAllocation;
use App\Services\Authority\ChangeRoleGrant;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;

class TeachingAllocationController extends Controller
{
    public function __invoke(ChangeTeachingAllocationRequest $request, ChangeRoleGrant $grants): RedirectResponse
    {
        DB::transaction(function () use ($request, $grants): void {
            $lecturer = Lecturer::where('staff_number', $request->validated('staff_number'))->lockForUpdate()->firstOrFail();
            $offering = Offering::where('external_offering_id', $request->validated('offering'))->firstOrFail();
            $key = ['offering_id' => $offering->id, 'lecturer_id' => $lecturer->id];
            $remove = $request->validated('operation') === 'remove';
            $changed = $remove ? TeachingAllocation::where($key)->delete()
                : TeachingAllocation::unguarded(fn () => TeachingAllocation::firstOrCreate($key))->wasRecentlyCreated;
            $grants->apply($lecturer->user_id, 'lecturer', 'offering:'.$offering->id, $remove, $request->user()->id);
            if ($changed) {
                AuditLog::forceCreate(['subject_key' => 'offering:'.$offering->id, 'actor_id' => $request->user()->id,
                    'occurred_at' => now(), 'action' => $remove ? 'allocation.removed' : 'allocation.assigned',
                    'details' => ['lecturer' => $lecturer->id]]);
            }
        });

        return to_route('staff.index');
    }
}
