import '../../assessment/assessment.css';
import { Head, Link } from '@inertiajs/react';
import { SetupBook } from '../../assessment/SetupBook';
import { SetupAssignment } from '../../assessment/SetupAssignment';
import { SetupExam } from '../../assessment/SetupExam';
import { acceptsDirectScores, type ItemKind } from '../../assessment/contracts';
import { Field, Post, Roster, WindowFields, type Member } from '../../assessment/Fields';
import { ResultRevisions, type Grade } from '../../assessment/ResultRevisions';

type Item = {
    id: string;
    title: string;
    kind: ItemKind;
    assignment: string | null;
    exam: string | null;
    returned: number | null;
    maximum_score: string;
    weight_percent: string;
    rubric: { guide?: string } | null;
    attempts: {
        id: string;
        enrolment_id: string;
        ordinal: number;
    }[];
};
type Props = {
    offering: string;
    book: string | null;
    items: Item[];
    grades: Grade[];
    teacher: boolean;
    officer: boolean;
    learner: boolean;
    roster: Member[];
};
export default function Desk({
    offering,
    book,
    items,
    grades,
    teacher,
    officer,
    learner,
    roster,
}: Props) {
    const who = (id: string) => roster.find((m) => m.id === id)?.name;

    return (
        <main className="assessment-page">
            <Head title="Assessments" />
            <h1>Assessments and results</h1>
            {!book &&
                (teacher ? (
                    <SetupBook url={`/courses/${offering}/assessments`} />
                ) : (
                    <p>No assessments configured.</p>
                ))}
            {items.map((i) => (
                <section key={i.id}>
                    <h2>{i.title}</h2>
                    <p>
                        {i.weight_percent}% of result · Maximum {i.maximum_score} points
                    </p>
                    <p>{i.rubric?.guide}</p>
                    {i.returned !== null && <p>Returned score: {i.returned}</p>}
                    {i.kind === 'assignment' &&
                        (i.assignment && (teacher || learner) ? (
                            <Link href={`/assignments/${i.assignment}`}>View assignment</Link>
                        ) : teacher ? (
                            <SetupAssignment id={i.id} />
                        ) : null)}
                    {i.kind === 'exam' && (
                        <>
                            {!i.exam && teacher && <SetupExam id={i.id} />}{' '}
                            {i.exam && learner && (
                                <Post
                                    url={`/examinations/${i.exam}/start`}
                                    button="Start or resume exam"
                                />
                            )}
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
                                    <Post
                                        url={`/examinations/${i.exam}/accommodations`}
                                        button="Approve override"
                                    >
                                        <Roster members={roster} />
                                        <WindowFields />
                                        <Field
                                            type="number"
                                            name="duration_seconds"
                                            label="Duration in seconds"
                                        />
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
            ))}
            {book && teacher && (
                <details>
                    <summary>Compute results</summary>
                    {roster.map((m) => (
                        <Post
                            key={m.id}
                            url={`/gradebooks/${book}/compute/${m.id}`}
                            button={`Compute ${m.name}`}
                        />
                    ))}
                </details>
            )}
            <ResultRevisions grades={grades} teacher={teacher} officer={officer} who={who} />
        </main>
    );
}
