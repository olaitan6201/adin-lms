<?php

namespace App\Services\Insights;

use App\Enums\PermissionCode;
use App\Models\User;
use App\Services\Authority\ScopedAuthority;

final class ReportContext
{
    public function __construct(private InsightScope $scope, private ScopedAuthority $authority) {}

    /** @return array{label: string, scope: ?string} */
    public function forUser(User $user, ReportAudience $audience): array
    {
        $label = match (true) {
            $audience->isAggregate() => $audience->value,
            $this->authority->institutionAllows($user, PermissionCode::ComplianceRead) => 'Quality assurance',
            $this->authority->institutionAllows($user, PermissionCode::ExaminationsManage) => 'Examinations office',
            $this->authority->institutionAllows($user, PermissionCode::OperationsManage) => 'Operations',
            $audience === ReportAudience::Lecturer || $user->student()->exists() => $audience->value,
            default => 'Academic portal',
        };
        $scope = match ($audience) {
            ReportAudience::Institution => 'Institution-wide',
            ReportAudience::AcademicUnit => 'Assigned academic units',
            ReportAudience::Lecturer => 'Assigned course offerings',
            ReportAudience::Student => 'Your registered courses',
        };

        return [
            'label' => $label,
            'scope' => $audience->isAggregate() || $this->scope->offerings($user, $audience)->exists() ? $scope : null,
        ];
    }
}
