import { CourseDisclosure } from '@/components/learning/CourseDisclosure';
import { ExamWindow } from '@/components/assessments/exams/ExamWindow';
import { Link } from '@inertiajs/react';
import { SetupExam } from '@/components/assessments/exams/SetupExam';
import { Post } from '../Post';
import { Field, Roster } from '../Fields';
import type { AssessmentItemProps } from './AssessmentItemPanel';

export function ExamItemActions({ item: i, teacher, learner, officer, roster, who }: AssessmentItemProps) {
    return (
        <>
            {!i.exam && teacher && (
                <Link
                    className="text-primary underline underline-offset-4"
                    href={`/assessment-items/${i.id}/questions/select`}
                >
                    Assemble from the question bank
                </Link>
            )}
            {!i.exam && teacher && <SetupExam id={i.id} />}{' '}
            {i.exam && teacher && (
                <Link
                    className="text-primary underline underline-offset-4"
                    href={`/examinations/${i.exam}/integrity`}
                >
                    Exam conditions and observations
                </Link>
            )}
            {i.exam && learner && (
                <Post url={`/examinations/${i.exam}/start`} button="Start or resume exam" />
            )}
            {i.attempts.map((a) => (
                <p key={a.id}>
                    <Link
                        className="text-primary underline underline-offset-4"
                        href={`/attempts/${a.id}/review`}
                    >
                        Review {who(a.enrolment_id)} · attempt {a.ordinal}
                    </Link>
                </p>
            ))}
            {i.exam && officer && (
                <CourseDisclosure label="Individual accommodation">
                    <Post url={`/examinations/${i.exam}/accommodations`} button="Approve override">
                        <Roster members={roster} />
                        <ExamWindow />
                        <Field type="number" name="duration_seconds" label="Duration in seconds" />
                        <Field type="number" name="max_attempts" label="Attempt cap" />
                    </Post>
                </CourseDisclosure>
            )}
        </>
    );
}
