import { ExamWindow } from './ExamWindow';
import { Button } from '@/components/ui/button';
import { Link } from '@inertiajs/react';
import type { PolicyDefinition } from './SetupBook';
import { SetupAssignment } from './SetupAssignment';
import { SetupExam } from './SetupExam';
import { acceptsDirectScores, type ItemKind } from './contracts';
import { Field, Post, Roster, type Member } from './Fields';

export type Item = {
    id: string;
    title: string;
    kind: ItemKind;
    assignment: string | null;
    exam: string | null;
    returned: number | null;
    maximum_score: string;
    weight_percent: string;
    rubric: {
        guide?: string;
        criteria?: PolicyDefinition['items'][number]['criteria'];
    } | null;
    attempts: {
        id: string;
        enrolment_id: string;
        ordinal: number;
    }[];
};

type Props = {
    item: Item;
    teacher: boolean;
    learner: boolean;
    officer: boolean;
    roster: Member[];
    who: (id: string) => string | undefined;
};

export function AssessmentItemPanel({ item: i, teacher, learner, officer, roster, who }: Props) {
    return (
        <section className="portal-panel assessment-item" id={`item-${i.id}`}>
            <p className="portal-kicker">{i.kind}</p>
            <h2>{i.title}</h2>
            <p>
                {i.weight_percent}% of result · Maximum {i.maximum_score} points
            </p>
            <p>{i.rubric?.guide}</p>
            {i.returned !== null && <p>Returned score: {i.returned}</p>}
            {i.kind === 'assignment' &&
                (i.assignment && (teacher || learner) ? (
                    <Button asChild>
                        <Link href={`/assignments/${i.assignment}`}>View assignment</Link>
                    </Button>
                ) : teacher ? (
                    <SetupAssignment id={i.id} />
                ) : null)}
            {i.kind === 'exam' && (
                <>
                    {!i.exam && teacher && (
                        <Link href={`/assessment-items/${i.id}/questions/select`}>Assemble from the question bank</Link>
                    )}
                    {!i.exam && teacher && <SetupExam id={i.id} />}{' '}
                    {i.exam && teacher && (
                        <Link href={`/examinations/${i.exam}/integrity`}>Exam conditions and observations</Link>
                    )}
                    {i.exam && learner && <Post url={`/examinations/${i.exam}/start`} button="Start or resume exam" />}
                    {i.attempts.map((a) => (
                        <p key={a.id}>
                            <Link href={`/attempts/${a.id}/review`}>
                                Review {who(a.enrolment_id)} · attempt {a.ordinal}
                            </Link>
                        </p>
                    ))}
                    {i.exam && officer && (
                        <details>
                            <summary>Individual accommodation</summary>
                            <Post url={`/examinations/${i.exam}/accommodations`} button="Approve override">
                                <Roster members={roster} />
                                <ExamWindow />
                                <Field type="number" name="duration_seconds" label="Duration in seconds" />
                                <Field type="number" name="max_attempts" label="Attempt cap" />
                            </Post>
                        </details>
                    )}
                </>
            )}
            {teacher && acceptsDirectScores(i.kind) && (
                <Post url={`/assessment-items/${i.id}/score`} button="Record score">
                    <Roster members={roster} />
                    <Field label="Points" type="number" name="points" />
                    <Field label="Reason" name="reason" />
                </Post>
            )}
        </section>
    );
}
