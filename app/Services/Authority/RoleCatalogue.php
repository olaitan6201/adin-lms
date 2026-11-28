<?php

namespace App\Services\Authority;

use App\Enums\PermissionCode;
use App\Enums\RoleCode;

final class RoleCatalogue
{
    private const ADMIN_PERMISSIONS = [
        PermissionCode::RosterRead, PermissionCode::AccountsManage, PermissionCode::StaffManage,
        PermissionCode::AcademicsManage, PermissionCode::CurriculumEdit, PermissionCode::OfferingsManage,
        PermissionCode::PortabilityManage,
    ];

    /** @return list<PermissionCode> */
    public static function permissions(RoleCode $role): array
    {
        return match ($role) {
            RoleCode::SuperAdmin => [...self::ADMIN_PERMISSIONS, PermissionCode::GrantsManage, PermissionCode::LoginEventsRead,
                PermissionCode::CurriculumApprove, PermissionCode::OperationsManage, PermissionCode::PrivacyManage],
            RoleCode::InstitutionalAdmin => self::ADMIN_PERMISSIONS,
            RoleCode::IctAdmin => [PermissionCode::LoginEventsRead, PermissionCode::OperationsManage],
            RoleCode::Dean, RoleCode::HeadOfDepartment, RoleCode::Lecturer => [PermissionCode::RosterRead],
            RoleCode::Student => [PermissionCode::CoursesReadOwn],
            RoleCode::ExaminationOfficer => [PermissionCode::ExaminationsManage],
            RoleCode::QualityAssuranceOfficer => [PermissionCode::ComplianceRead],
            RoleCode::Guardian => [PermissionCode::ProgressReadApproved],
            RoleCode::Registrar => [PermissionCode::PlacementApprove],
        };
    }

    /** Compatibility for callers comparing persisted scope names. */
    public static function scopeType(RoleCode|string $role): ?string
    {
        $code = $role instanceof RoleCode ? $role : RoleCode::tryFrom($role);

        return $code?->scope()->value;
    }
}
