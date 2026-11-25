import { Form, Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import { EntryForm } from './EntryForm';

type Week = {
    title: string;
    body: string;
};
type Snapshot = {
    title: string;
    introduction: string;
    weeks: Week[];
    shell: {
        external_offering_id: string;
        section: string | null;
        delivery_mode: string | null;
    };
};
type Plan = {
    id: string;
    revision: number;
    snapshot: Snapshot;
    author: string;
    reviewer: string | null;
    reason: string | null;
    status: string;
    submitted_at: string;
    reviewed_at: string | null;
    canDecide: boolean;
};
type Props = {
    shell: string;
    base: string;
    back: string;
    canSubmit: boolean;
    history: Plan[];
};

type ProposalFormProps = {
    base: string;
    previous?: Plan;
};

function ProposalForm({ base, previous }: ProposalFormProps) {
    const [count, setCount] = useState(previous?.snapshot.weeks.length ?? 1);
    return (
        <section>
            <h2 className="text-xl font-semibold">{previous ? 'Revise your proposal' : 'Propose a teaching plan'}</h2>
            <EntryForm action={base} label="Submit for academic review">
                <input type="hidden" name="previous_revision" value={previous?.revision ?? 0} />
                <label>
                    Proposed teaching title
                    <input name="title" required maxLength={191} defaultValue={previous?.snapshot.title} />
                </label>
                <label>
                    Course introduction and outcomes
                    <textarea
                        name="introduction"
                        required
                        rows={4}
                        maxLength={20000}
                        defaultValue={previous?.snapshot.introduction}
                    />
                </label>
                {Array.from({ length: count }, (_, i) => (
                    <fieldset key={i} className="portal-panel grid gap-2 p-4">
                        <legend>Week {i + 1}</legend>
                        <label>
                            Week {i + 1} title
                            <input
                                name={`weeks[${i}][title]`}
                                required
                                maxLength={191}
                                defaultValue={previous?.snapshot.weeks[i]?.title}
                            />
                        </label>
                        <label>
                            Week {i + 1} activities
                            <textarea
                                name={`weeks[${i}][body]`}
                                required
                                rows={3}
                                maxLength={10000}
                                defaultValue={previous?.snapshot.weeks[i]?.body}
                            />
                        </label>
                    </fieldset>
                ))}
                <div className="flex gap-4">
                    <button
                        type="button"
                        className="underline"
                        disabled={count >= 32}
                        onClick={() => setCount(count + 1)}
                    >
                        Add week
                    </button>
                    {count > 1 && (
                        <button type="button" className="underline" onClick={() => setCount(count - 1)}>
                            Remove last week
                        </button>
                    )}
                </div>
            </EntryForm>
        </section>
    );
}

function Decision({ action }: { action: string }) {
    const [decision, setDecision] = useState('approved');
    return (
        <Form action={action} method="post" className="my-4 grid max-w-xl gap-3">
            {({ processing, errors }) => (
                <>
                    <label className="grid">
                        Review decision
                        <select
                            className="border"
                            name="decision"
                            value={decision}
                            onChange={(e) => setDecision(e.target.value)}
                        >
                            <option value="approved">Approve draft lessons</option>
                            <option value="rejected">Reject and request revision</option>
                        </select>
                    </label>
                    <label className="grid">
                        Review note{decision === 'rejected' && ' (required)'}
                        <textarea
                            className="border"
                            name="reason"
                            maxLength={2000}
                            required={decision === 'rejected'}
                        />
                    </label>
                    {Object.values(errors).map((e) => (
                        <p role="alert" key={e}>
                            {e}
                        </p>
                    ))}
                    <button className="portal-action w-fit" disabled={processing}>
                        {processing ? 'Saving…' : 'Record decision'}
                    </button>
                </>
            )}
        </Form>
    );
}

export default function TeachingPlan({ shell, base, back, canSubmit, history }: Props) {
    return (
        <main className="portal-page max-w-3xl space-y-6">
            <Head title="Teaching plan" />
            <Link className="underline" href={back}>
                Return to offering
            </Link>
            <header>
                <p className="portal-kicker">{shell}</p>
                <h1 className="portal-title">Teaching plan</h1>
                <p>
                    Propose an introduction and weekly activities for this assigned shell. Approval creates draft
                    lessons; the offering stays unpublished.
                </p>
            </header>
            {canSubmit && <ProposalForm key={history[0]?.id ?? 'first'} base={base} previous={history[0]} />}
            <section className="space-y-3">
                <h2 className="text-xl font-semibold">Submitted revisions</h2>
                {!history.length && <p>No proposal has been submitted.</p>}
                {history.map((p) => (
                    <article className="portal-panel space-y-2 p-4" key={p.id}>
                        <p className="portal-kicker">
                            Revision {p.revision} · {p.status}
                        </p>
                        <h3 className="text-xl font-semibold">{p.snapshot.title}</h3>
                        <p>
                            Submitted by {p.author} · {new Date(p.submitted_at).toLocaleString()}
                        </p>
                        <p>
                            {[
                                p.snapshot.shell.external_offering_id,
                                p.snapshot.shell.section && `Section ${p.snapshot.shell.section}`,
                                p.snapshot.shell.delivery_mode,
                            ]
                                .filter(Boolean)
                                .join(' · ')}
                        </p>
                        <p className="whitespace-pre-wrap">{p.snapshot.introduction}</p>
                        <ol className="list-decimal space-y-2 pl-5">
                            {p.snapshot.weeks.map((w, i) => (
                                <li key={i}>
                                    <strong>{w.title}</strong>
                                    <p className="whitespace-pre-wrap">{w.body}</p>
                                </li>
                            ))}
                        </ol>
                        {p.reviewer && (
                            <p>
                                Reviewed by {p.reviewer}
                                {p.reviewed_at && ` · ${new Date(p.reviewed_at).toLocaleString()}`}
                                {p.reason && ` — ${p.reason}`}
                            </p>
                        )}
                        {p.canDecide && <Decision action={`${base}/${p.id}/review`} />}
                    </article>
                ))}
            </section>
        </main>
    );
}
