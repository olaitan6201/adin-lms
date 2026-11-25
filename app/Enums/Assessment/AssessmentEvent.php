<?php

namespace App\Enums\Assessment;

enum AssessmentEvent: string
{
    case ScoreRecorded = 'score.recorded';
    case ExamStarted = 'exam.started';
    case SaveRejected = 'exam.save_rejected';
    case ExamSubmitted = 'exam.submitted';
    case AccommodationApproved = 'exam.accommodation';
    case GradeCalculated = 'grade.calculated';
    case GradebookActivated = 'gradebook.activate';
    case PolicyAmended = 'gradebook.amend';
    case GradeExported = 'grade.export';
    case CorrectionRequested = 'grade.correct';
    case GradeApproved = 'grade.approve';
    case GradePublished = 'grade.publish';
}
