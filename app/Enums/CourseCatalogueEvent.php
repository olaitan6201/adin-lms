<?php

namespace App\Enums;

enum CourseCatalogueEvent: string
{
    case CourseCreated = 'course.created';
    case RevisionDrafted = 'course_revision.drafted';
    case RevisionUpdated = 'course_revision.updated';
    case RevisionReviewed = 'course_revision.reviewed';
    case RevisionApproved = 'course_revision.approved';
}
