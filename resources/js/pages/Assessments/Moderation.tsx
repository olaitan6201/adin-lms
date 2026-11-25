import { NativeSelect } from '@/components/ui/native-select';
import { Head, Link } from '@inertiajs/react';
import { Field, Post } from '../../assessment/Fields';
import type { Grade } from '../../assessment/ResultRevisions';
import '../../assessment/assessment.css';

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
        <main className="portal-page assessment-page">
            <Head title="Moderation evidence" />
            <Link href={desk}>Back to assessments</Link>
            <header className="assessment-heading">
                <p className="portal-kicker">Private moderation · Revision {grade.revision}</p>
                <h1 className="portal-title">Review result for {learner}</h1>
                <p>
                    {grade.total_percent}% · Grade {grade.grade} ·{' '}
                    {grade.published_at ? 'Published' : grade.moderation_status.replaceAll('_', ' ')}
                </p>
            </header>
            <section>
                <h2>Component marks</h2>
                <p>These are the score revisions used when this result was calculated.</p>
                <ul className="assessment-evidence">
                    {inputs.map((input, index) => (
                        <li key={index}>
                            <strong>{input.item}</strong>
                            <span>
                                {input.points} / {input.maximum} points
                            </span>
                            <small>
                                Weight {input.weight}% · Score revision {input.score_revision}
                            </small>
                            <details className="assessment-provenance">
                                <summary>Marking record</summary>
                                <p>
                                    {input.marker ?? 'Automatic score'} · {input.reason}
                                </p>
                                {input.criteria.map((c) => (
                                    <p key={c.criterion_title}>
                                        {c.criterion_title}: {c.level_label}, {c.points} points
                                        {c.feedback && ` · ${c.feedback}`}
                                    </p>
                                ))}
                            </details>
                        </li>
                    ))}
                </ul>
                <details>
                    <summary>Grading policy · version {policy.version}</summary>
                    <p>Rounding: {policy.rounding_rule.replaceAll('_', ' ')}</p>
                    <ul>
                        {boundaries.map((b) => (
                            <li key={b.minimum_percent}>
                                {b.grade}: at least {b.minimum_percent}%
                            </li>
                        ))}
                    </ul>
                </details>
            </section>
            {superseded && !grade.published_at && (
                <p>A newer result has replaced this revision. Return to assessments to review it.</p>
            )}
            {!superseded && !grade.published_at && (pending || approved) && (
                <section>
                    <h2>{pending ? 'Moderation decision' : 'Release result'}</h2>
                    <Post url={`/grades/${grade.id}/review`} button={pending ? 'Record decision' : 'Publish result'}>
                        {pending ? (
                            <label>
                                Decision
                                <NativeSelect name="decision" aria-label="Decision" required defaultValue="">
                                    <option value="" disabled>
                                        Choose a decision
                                    </option>
                                    <option value="correct">Request correction</option>
                                    <option value="approve">Approve</option>
                                </NativeSelect>
                            </label>
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
            <section>
                <h2>Revision history</h2>
                <ol>
                    {history.map((e, i) => (
                        <li key={i}>
                            <strong>{eventLabels[e.action] ?? e.action}</strong> · {e.actor ?? 'System'} ·{' '}
                            <time dateTime={e.at}>{new Date(e.at).toLocaleString()}</time>
                            {e.reason && <p>{e.reason}</p>}
                        </li>
                    ))}
                </ol>
            </section>
        </main>
    );
}
