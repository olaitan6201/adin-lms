import { CourseDisclosure } from '@/components/learning/CourseDisclosure';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
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
        <Card id={`item-${i.id}`} className="scroll-mt-6">
            <CardContent className="grid min-w-0 justify-items-start gap-3 [&>form]:w-full [&>details]:w-full">
                <Badge variant="secondary">{i.kind}</Badge>
                <h2 className="text-xl font-semibold tracking-tight">{i.title}</h2>
                <p>
                    {i.weight_percent}% of result · Maximum {i.maximum_score} points
                </p>
                {i.rubric?.guide && <p>{i.rubric.guide}</p>}
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
                            <Link className="text-primary underline underline-offset-4" href={`/assessment-items/${i.id}/questions/select`}>Assemble from the question bank</Link>
                        )}
                        {!i.exam && teacher && <SetupExam id={i.id} />}{' '}
                        {i.exam && teacher && (
                            <Link className="text-primary underline underline-offset-4" href={`/examinations/${i.exam}/integrity`}>Exam conditions and observations</Link>
                        )}
                        {i.exam && learner && <Post url={`/examinations/${i.exam}/start`} button="Start or resume exam" />}
                        {i.attempts.map((a) => (
                            <p key={a.id}>
                                <Link className="text-primary underline underline-offset-4" href={`/attempts/${a.id}/review`}>
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
                )}
                {teacher && acceptsDirectScores(i.kind) && (
                    <Post url={`/assessment-items/${i.id}/score`} button="Record score">
                        <Roster members={roster} />
                        <Field label="Points" type="number" name="points" />
                        <Field label="Reason" name="reason" />
                    </Post>
                )}
            </CardContent>
        </Card>
    );
}
