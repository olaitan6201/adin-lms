import { Form, Link } from '@inertiajs/react';

type CaseFile = {
    id: string; reference: string; kind: string; stage: string; next: string | null; evidence: string; owner: string;
    receipts: { id: string; time: string; actor: string; stage: string; reference: string }[];
};
export type CasePage = { data: CaseFile[]; links: { next: string | null; prev: string | null } };
const label = (value: string) => value.replaceAll('_', ' ');
const field = 'block w-full rounded border p-2';
const button = 'rounded bg-teal-900 px-3 py-2 text-white';

export default function PrivacyCaseRegister({ cases }: { cases: CasePage }) {
    return <section aria-label="Case register" className="space-y-4">
        <h2 className="text-xl font-semibold">Case register</h2>
        <p>The opening officer owns follow-up. Keep identities, correspondence, deadlines and documents in the restricted case system. Enter only its opaque references here.</p>
        <Form action="/operations/privacy/cases" method="post">
            {({ processing, errors, recentlySuccessful }) => <fieldset className="grid min-w-0 gap-2">
                <legend className="font-semibold">Open a case</legend>
                <label>Case type<select className={field} name="kind"><option value="subject_access">Subject access</option><option value="breach">Breach response</option><option value="retention_hold">Retention hold</option></select></label>
                <label>External case reference<input className={field} name="reference" required maxLength={64} /></label>
                <label>Affected account UUID (required except for breaches)<input className={field} name="subject_id" /></label>
                {Object.values(errors).map(error => <p key={error} role="alert">{error}</p>)}
                <button className={button} disabled={processing}>Open case</button>
                {recentlySuccessful && <p role="status">Case opened.</p>}
            </fieldset>}
        </Form>
        {cases.data.length === 0 && <p>No cases recorded.</p>}
        {cases.data.map(row => <article key={row.id} className="space-y-2 break-words border-t py-3">
            <h3 className="font-semibold">{row.reference} · {label(row.kind)}</h3>
            <p>Stage: {label(row.stage)}. Latest evidence: {row.evidence}.</p>
            <p>Responsible officer: {row.owner}</p>
            <details><summary className="cursor-pointer underline">Decision history</summary>
                <ol className="space-y-2 py-2">{row.receipts.map(receipt => <li key={receipt.id}>
                    {new Date(receipt.time).toLocaleString()} · {label(receipt.stage)} · {receipt.reference}
                    <br />Recorded by {receipt.actor}
                </li>)}</ol>
            </details>
            {row.next && <Form method="post" action={`/operations/privacy/cases/${row.id}`}>
                {({ processing, errors }) => <fieldset className="grid min-w-0 gap-2">
                    <legend>Record next step: {label(row.next!)}</legend>
                    <input type="hidden" name="stage" value={row.stage} />
                    <label>Decision or delivery receipt for {row.reference}<input className={field} name="reference" maxLength={64} required /></label>
                    {Object.values(errors).map(error => <p key={error} role="alert">{error}</p>)}
                    <button className={button} disabled={processing}>Record {label(row.next!)}</button>
                </fieldset>}
            </Form>}
        </article>)}
        <nav aria-label="Case register pages" className="flex gap-4">
            {cases.links.prev && <Link className="underline" href={cases.links.prev}>Previous cases</Link>}
            {cases.links.next && <Link className="underline" href={cases.links.next}>More cases</Link>}
        </nav>
    </section>;
}
