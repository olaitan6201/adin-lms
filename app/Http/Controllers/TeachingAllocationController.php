<?php

namespace App\Http\Controllers;

use App\Enums\AllocationOperation;
use App\Enums\RoleCode;
use App\Enums\ScopeType;
use App\Enums\StaffAuditEvent;
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
    public function __invoke(
        ChangeTeachingAllocationRequest $request,
        ChangeRoleGrant $grants,
    ): RedirectResponse {
        DB::transaction(function () use ($request, $grants): void {
            $lecturer = Lecturer::where('staff_number', $request->validated('staff_number'))
                ->lockForUpdate()
                ->firstOrFail();
            abort_if($lecturer->user_id === $request->user()->id, 403);
            $offering = Offering::where(
                'external_offering_id',
                $request->validated('offering'),
            )->firstOrFail();
            $key = ['offering_id' => $offering->id, 'lecturer_id' => $lecturer->id];
            $remove = $request->enum('operation', AllocationOperation::class) === AllocationOperation::Remove;
            $changed = $remove
                ? TeachingAllocation::where($key)->delete()
                : TeachingAllocation::unguarded(fn () => TeachingAllocation::firstOrCreate($key))
                    ->wasRecentlyCreated;
            $grants->apply(
                $lecturer->user_id,
                RoleCode::Lecturer,
                ScopeType::Offering->key($offering->id),
                $remove,
                $request->user()->id,
            );
            if ($changed) {
                AuditLog::forceCreate([
                    'subject_key' => 'offering:'.$offering->id,
                    'actor_id' => $request->user()->id,
                    'occurred_at' => now(),
                    'action' => $remove
                        ? StaffAuditEvent::AllocationRemoved->value
                        : StaffAuditEvent::AllocationAssigned->value,
                    'details' => ['lecturer' => $lecturer->id],
                ]);
            }
        });

        return to_route('staff.index');
    }
}
