import { Form, Link } from '@inertiajs/react';
import { useState } from 'react';
import { OperationsInput, OperationsSelect, CorrectionFocus } from './OperationsFields';

type CaseFile = {
    id: string;
    reference: string;
    kind: string;
    stage: string;
    next: string | null;
    evidence: string;
    owner: string;
    receipts: {
        id: string;
        time: string;
        actor: string;
        stage: string;
        reference: string;
    }[];
};
export type CasePage = {
    data: CaseFile[];
    links: {
        next: string | null;
        prev: string | null;
    };
};
const label = (value: string) => value.replaceAll('_', ' ');
const button = 'portal-action justify-self-start';

export default function PrivacyCaseRegister({ cases }: { cases: CasePage }) {
    const [kind, setKind] = useState('subject_access');
    return (
        <section aria-label="Case register" className="space-y-4">
            <h2 className="text-xl font-semibold">Case register</h2>
            <p>
                The opening officer owns follow-up. Keep identities, correspondence, deadlines and documents in the
                restricted case system. Enter only its opaque references here.
            </p>
            <Form id="open-case" className="portal-panel desk-shelf" action="/operations/privacy/cases" method="post">
                {({ processing, errors, recentlySuccessful }) => (
                    <fieldset className="grid min-w-0 gap-2">
                        <legend className="desk-section">Open a case</legend>
                        <CorrectionFocus errors={errors} />
                        <OperationsSelect label="Case type" name="kind" error={errors.kind} value={kind}
                            onChange={event => setKind(event.target.value)}>
                            <option value="subject_access">Subject access</option>
                            <option value="breach">Breach response</option>
                            <option value="retention_hold">Retention hold</option>
                            <option value="records_disposition">Records disposition (custodian executed)</option>
                        </OperationsSelect>
                        {kind === 'records_disposition' && <p>For disposition, link the approved schedule and inventory first. A separate officer authorises the
                            decision. The custodian checks holds again before acting in the source system and returns an
                            execution receipt for independent verification. Advancing a case does not delete data.</p>}
                        <OperationsInput label="External case reference" name="reference" required maxLength={64}
                            error={errors.reference} aria-describedby="reference-format" />
                        <small id="reference-format">Use letters, numbers, underscores or hyphens only.</small>
                        <OperationsInput label="Affected account UUID (required except for breaches)" name="subject_id"
                            error={errors.subject_id && 'Enter the affected account’s existing UUID from the restricted case system.'} />
                        <button className={button} disabled={processing}>
                            Open case
                        </button>
                        {recentlySuccessful && <p role="status">Case opened.</p>}
                    </fieldset>
                )}
            </Form>
            <h2 className="desk-section">Continue a case</h2>
            {cases.data.length === 0 && <p>No cases recorded.</p>}
            {cases.data.map((row) => (
                <article key={row.id} className="space-y-2 break-words border-t py-3">
                    <h3 className="font-semibold">
                        {row.reference} · {label(row.kind)}
                    </h3>
                    <p>
                        Stage: {label(row.stage)}. Latest evidence: {row.evidence}.
                    </p>
                    <p>Responsible officer: {row.owner}</p>
                    <details>
                        <summary className="cursor-pointer underline">Decision history</summary>
                        <ol className="space-y-2 py-2">
                            {row.receipts.map((receipt) => (
                                <li key={receipt.id}>
                                    {new Date(receipt.time).toLocaleString()} · {label(receipt.stage)} ·{' '}
                                    {receipt.reference}
                                    <br />
                                    Recorded by {receipt.actor}
                                </li>
                            ))}
                        </ol>
                    </details>
                    {row.next && (
                        <Form id={`continue-${row.id}`}
                            method="post" action={`/operations/privacy/cases/${row.id}`}>
                            {({ processing, errors }) => (
                                <fieldset className="grid min-w-0 gap-2">
                                    <legend>Record next step: {label(row.next!)}</legend>
                                    <CorrectionFocus errors={errors} />
                                    <input type="hidden" name="stage" value={row.stage} />
                                    <OperationsInput label={`Decision or delivery receipt for ${row.reference}`}
                                        name="reference" maxLength={64} required error={errors.reference} />
                                    {errors.stage && <p role="alert">Reload this case to check its current stage.</p>}
                                    <button className="justify-self-start rounded border px-3 py-2" disabled={processing}>
                                        Record {label(row.next!)}
                                    </button>
                                </fieldset>
                            )}
                        </Form>
                    )}
                </article>
            ))}
            <nav aria-label="Case register pages" className="flex gap-4">
                {cases.links.prev && (
                    <Link className="underline" href={cases.links.prev}>
                        Previous cases
                    </Link>
                )}
                {cases.links.next && (
                    <Link className="underline" href={cases.links.next}>
                        More cases
                    </Link>
                )}
            </nav>
        </section>
    );
}
