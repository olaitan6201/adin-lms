import { NativeSelect } from '@/components/ui/native-select';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Form, Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import { TeachingProposalForm } from './TeachingProposalForm';

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
export type Plan = {
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

function Decision({ action }: { action: string }) {
    const [decision, setDecision] = useState('approved');
    return (
        <Form action={action} method="post" className="my-4 grid max-w-xl gap-3">
            {({ processing, errors }) => (
                <>
                    <label className="grid">
                        Review decision
                        <NativeSelect
                            name="decision"
                            value={decision}
                            onChange={(e) => setDecision(e.target.value)}
                        >
                            <option value="approved">Approve draft lessons</option>
                            <option value="rejected">Reject and request revision</option>
                        </NativeSelect>
                    </label>
                    <label className="grid">
                        Review note{decision === 'rejected' && ' (required)'}
                        <Textarea
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
                    <Button disabled={processing}>
                        {processing ? 'Saving…' : 'Record decision'}
                    </Button>
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
            {canSubmit && <TeachingProposalForm key={history[0]?.id ?? 'first'} base={base} previous={history[0]} />}
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
