<?php

namespace App\Services\Academics;

use App\Enums\CourseCatalogueEvent;
use App\Enums\OrganisationAuditAction;
use App\Enums\PathwayCurriculumAuditAction;
use App\Models\AuditLog;
use App\Models\DomainModel;
use App\Models\User;

final class AcademicCoreAudit
{
    public function record(
        User $actor,
        DomainModel $subject,
        CourseCatalogueEvent|OrganisationAuditAction|PathwayCurriculumAuditAction $action,
        array $details,
    ): void {
        AuditLog::forceCreate([
            'actor_id' => $actor->id,
            'subject_key' => $subject->getTable().':'.$subject->getKey(),
            'action' => $action,
            'occurred_at' => now(),
            'details' => $details,
        ]);
    }
}
