import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from '@inertiajs/react';
import type { PolicyDefinition } from './SetupBook';
import { SetupAssignment } from '@/components/assessments/assignments/SetupAssignment';
import { acceptsDirectScores, type ItemKind } from '@/components/assessments/contracts';
import { Post } from '../Post';
import { Field, Roster, type Member } from '../Fields';
import { ExamItemActions } from './ExamItemActions';

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

export type AssessmentItemProps = {
    item: Item;
    teacher: boolean;
    learner: boolean;
    officer: boolean;
    roster: Member[];
    who: (id: string) => string | undefined;
};

export function AssessmentItemPanel({
    item: i,
    teacher,
    learner,
    officer,
    roster,
    who,
}: AssessmentItemProps) {
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
                    <ExamItemActions
                        item={i}
                        teacher={teacher}
                        learner={learner}
                        officer={officer}
                        roster={roster}
                        who={who}
                    />
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
