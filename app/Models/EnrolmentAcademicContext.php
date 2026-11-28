<?php

namespace App\Models;

use App\Models\Concerns\AppendOnly;

final class EnrolmentAcademicContext extends DomainModel
{
    use AppendOnly;

    public const UPDATED_AT = null;

    protected $fillable = [
        'enrolment_id', 'offering_id', 'offering_curriculum_course_id', 'placement_acceptance_id', 'linked_by',
    ];
}
