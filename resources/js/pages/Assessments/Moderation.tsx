import { AssessmentWorkspace } from '../../assessment/AssessmentWorkspace';
import { NativeSelectOption } from '@/components/ui/native-select';
import { CourseDisclosure } from '@/components/learning/CourseDisclosure';
import { ValidatedSelect } from '../../assessment/ValidatedFields';
import { Label } from '@/components/ui/label';
import { Head, Link } from '@inertiajs/react';
import { Field, Post } from '../../assessment/Fields';
import type { Grade } from '../../assessment/ResultRevisions';

type Input = {
    item: string;
    points: string;
    maximum: string;
    weight: string;
    score_revision: number;
    marker: string | null;
    reason: string;
    criteria: {
        criterion_title: string;
        level_label: string;
        points: string;
        feedback: string | null;
    }[];
};
type Event = {
    action: string;
    at: string;
    actor: string | null;
    reason: string | null;
};
const eventLabels: Record<string, string> = {
    'grade.calculated': 'Result calculated',
    'grade.correct': 'Correction requested',
    'grade.approve': 'Approved for release',
    'grade.publish': 'Result published',
    'grade.export': 'Result sheet downloaded',
};
type Props = {
    desk: string;
    learner: string;
    grade: Grade;
    superseded: boolean;
    policy: {
        version: number;
        rounding_rule: string;
    };
    inputs: Input[];
    boundaries: {
        grade: string;
        minimum_percent: string;
    }[];
    history: Event[];
};

export default function Moderation({ desk, learner, grade, superseded, policy, inputs, boundaries, history }: Props) {
    const pending = grade.moderation_status === 'pending';
    const approved = grade.moderation_status === 'approved';
    return (
        <AssessmentWorkspace>
            <Head title="Moderation evidence" />
            <Link className="text-primary underline underline-offset-4" href={desk}>Back to assessments</Link>
            <header className="space-y-3 border-b pb-5">
                <p className="text-sm font-medium text-muted-foreground">Private moderation · Revision {grade.revision}</p>
                <h1 className="text-3xl font-semibold tracking-tight">Review result for {learner}</h1>
                <p>
                    {grade.total_percent}% · Grade {grade.grade} ·{' '}
                    {grade.published_at ? 'Published' : grade.moderation_status.replaceAll('_', ' ')}
                </p>
            </header>
            <section className="min-w-0 space-y-3">
                <h2 className="text-xl font-semibold tracking-tight">Component marks</h2>
                <p>These are the score revisions used when this result was calculated.</p>
                <ul className="divide-y">
                    {inputs.map((input, index) => (
                        <li key={index} className="grid gap-2 py-3 sm:grid-cols-3">
                            <strong>{input.item}</strong>
                            <span>
                                {input.points} / {input.maximum} points
                            </span>
                            <small>
                                Weight {input.weight}% · Score revision {input.score_revision}
                            </small>
                            <CourseDisclosure className="sm:col-span-full" label="Marking record">
                                <p>
                                    {input.marker ?? 'Automatic score'} · {input.reason}
                                </p>
                                {input.criteria.map((c) => (
                                    <p key={c.criterion_title}>
                                        {c.criterion_title}: {c.level_label}, {c.points} points
                                        {c.feedback && ` · ${c.feedback}`}
                                    </p>
                                ))}
                            </CourseDisclosure>
                        </li>
                    ))}
                </ul>
                <CourseDisclosure label={`Grading policy · version ${policy.version}`}>
                    <p>Rounding: {policy.rounding_rule.replaceAll('_', ' ')}</p>
                    <ul>
                        {boundaries.map((b) => (
                            <li key={b.minimum_percent}>
                                {b.grade}: at least {b.minimum_percent}%
                            </li>
                        ))}
                    </ul>
                </CourseDisclosure>
            </section>
            {superseded && !grade.published_at && (
                <p>A newer result has replaced this revision. Return to assessments to review it.</p>
            )}
            {!superseded && !grade.published_at && (pending || approved) && (
                <section className="min-w-0 space-y-3">
                    <h2 className="text-xl font-semibold tracking-tight">{pending ? 'Moderation decision' : 'Release result'}</h2>
                    <Post url={`/grades/${grade.id}/review`} button={pending ? 'Record decision' : 'Publish result'}>
                        {pending ? (
                            <Label className="grid min-w-0 gap-2 leading-normal">
                                Decision
                                <ValidatedSelect name="decision" aria-label="Decision" required defaultValue="">
                                    <NativeSelectOption value="" disabled>
                                        Choose a decision
                                    </NativeSelectOption>
                                    <NativeSelectOption value="correct">Request correction</NativeSelectOption>
                                    <NativeSelectOption value="approve">Approve</NativeSelectOption>
                                </ValidatedSelect>
                            </Label>
                        ) : (
                            <>
                                <input type="hidden" name="decision" value="publish" />
                                <p>Publishing makes this revision and its component marks available to the learner.</p>
                            </>
                        )}
                        <Field label="Reason for decision" name="reason" />
                    </Post>
                </section>
            )}
            <section className="min-w-0 space-y-3">
                <h2 className="text-xl font-semibold tracking-tight">Revision history</h2>
                <ol className="ml-2 space-y-4 border-l pl-5">
                    {history.map((e, i) => (
                        <li key={i} className="relative before:absolute before:top-1.5 before:-left-[26px] before:size-2.5 before:rounded-full before:bg-primary">
                            <strong>{eventLabels[e.action] ?? e.action}</strong> · {e.actor ?? 'System'} ·{' '}
                            <time dateTime={e.at}>{new Date(e.at).toLocaleString()}</time>
                            {e.reason && <p>{e.reason}</p>}
                        </li>
                    ))}
                </ol>
            </section>
        </AssessmentWorkspace>
    );
}
