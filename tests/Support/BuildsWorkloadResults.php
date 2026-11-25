<?php

namespace Tests\Support;

use App\Models\Enrolment;
use App\Models\Grade;
use App\Models\GradingPolicy;
use App\Models\User;

trait BuildsWorkloadResults
{
    private function grade(
        Enrolment $enrolment,
        string $percent,
        int $revision,
        bool $released,
        User $approver,
    ): Grade {
        $policy = GradingPolicy::unguarded(
            fn () => GradingPolicy::firstOrCreate(
                ['name' => 'Workload fixture', 'version' => 1],
                ['rounding_rule' => 'none'],
            ),
        );

        return Grade::forceCreate([
            'enrolment_id' => $enrolment->id,
            'policy_id' => $policy->id,
            'revision' => $revision,
            'total_percent' => $percent,
            'grade' => 'Recorded',
            'moderation_status' => $released ? 'approved' : 'pending',
            'approved_by' => $released ? $approver->id : null,
            'approved_at' => $released ? now() : null,
            'published_at' => $released ? now() : null,
        ]);
    }
}
