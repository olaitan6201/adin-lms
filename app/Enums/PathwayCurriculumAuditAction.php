<?php

namespace App\Enums;

enum PathwayCurriculumAuditAction: string
{
    case Created = 'curriculum.pathway.created';
    case Assigned = 'curriculum.pathway.assigned';
    case AssignmentUpdated = 'curriculum.pathway.assignment_updated';
    case ChoiceAdded = 'curriculum.pathway.choice_added';
    case PrerequisiteAdded = 'curriculum.pathway.prerequisite_added';
    case CourseOutcomeAdded = 'curriculum.pathway.course_outcome_added';
    case ProgrammeOutcomeAdded = 'curriculum.pathway.programme_outcome_added';
    case OutcomeMapped = 'curriculum.pathway.outcome_mapped';
    case Reviewed = 'curriculum.pathway.reviewed';
    case Approved = 'curriculum.pathway.approved';
    case Forked = 'curriculum.pathway.forked';
}
