<?php

namespace App\Enums;

enum RoleCode: string
{
    case SuperAdmin = 'super_admin';
    case InstitutionalAdmin = 'institutional_admin';
    case IctAdmin = 'ict_admin';
    case Dean = 'dean';
    case HeadOfDepartment = 'head_of_department';
    case Lecturer = 'lecturer';
    case Student = 'student';
    case ExaminationOfficer = 'examination_officer';
    case QualityAssuranceOfficer = 'quality_assurance_officer';
    case Guardian = 'guardian';

    public function scope(): ScopeType
    {
        return match ($this) {
            self::Dean => ScopeType::Faculty,
            self::HeadOfDepartment => ScopeType::Department,
            self::Lecturer => ScopeType::Offering,
            self::SuperAdmin, self::InstitutionalAdmin, self::IctAdmin,
            self::Student, self::ExaminationOfficer, self::QualityAssuranceOfficer,
            self::Guardian => ScopeType::Institution,
        };
    }
}
