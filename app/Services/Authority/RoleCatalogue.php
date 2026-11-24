<?php

namespace App\Services\Authority;

final class RoleCatalogue
{
    public const MATRIX = [
        'super_admin' => ['roster.read', 'accounts.manage', 'login_events.read', 'staff.manage', 'academics.manage', 'curriculum.edit', 'offerings.manage', 'curriculum.approve'],
        'institutional_admin' => ['roster.read', 'accounts.manage', 'staff.manage', 'academics.manage', 'curriculum.edit', 'offerings.manage'],
        'ict_admin' => ['login_events.read'],
        'dean' => ['roster.read'],
        'head_of_department' => ['roster.read'],
        'lecturer' => ['roster.read'],
        'student' => ['courses.read_own'],
        'examination_officer' => ['examinations.manage'],
        'quality_assurance_officer' => ['compliance.read'],
        'guardian' => ['progress.read_approved'],
    ];

    public static function scopeType(string $role): ?string
    {
        return match ($role) {
            'dean' => 'faculty',
            'head_of_department' => 'department',
            'lecturer' => 'offering',
            default => isset(self::MATRIX[$role]) ? 'institution' : null,
        };
    }
}
