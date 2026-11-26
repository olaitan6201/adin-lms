import { NativeSelectOption } from '@/components/ui/native-select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Form, Link } from '@inertiajs/react';
import { useState } from 'react';
import { OperationsInput, OperationsSelect, CorrectionFocus } from '../OperationsFields';

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

export default function PrivacyCaseRegister({ cases }: { cases: CasePage }) {
    const [kind, setKind] = useState('subject_access');
    return (
        <section aria-label="Case register" className="card min-w-0 space-y-4 p-5">
            <h2 className="card-title">Case register</h2>
            <p>
                The opening officer owns follow-up. Keep identities, correspondence, deadlines and documents in the
                restricted case system. Enter only its opaque references here.
            </p>
            <Card><CardContent><Form id="open-case" className="min-w-0" action="/operations/privacy/cases" method="post">
                {({ processing, errors, recentlySuccessful }) => (
                    <fieldset className="grid min-w-0 gap-2">
                        <legend className="text-xl font-semibold">Open a case</legend>
                        <CorrectionFocus errors={errors} />
                        <OperationsSelect label="Case type" name="kind" error={errors.kind} value={kind}
                            onChange={event => setKind(event.target.value)}>
                            <NativeSelectOption value="subject_access">Subject access</NativeSelectOption>
                            <NativeSelectOption value="breach">Breach response</NativeSelectOption>
                            <NativeSelectOption value="retention_hold">Retention hold</NativeSelectOption>
                            <NativeSelectOption value="records_disposition">Records disposition (custodian executed)</NativeSelectOption>
                        </OperationsSelect>
                        {kind === 'records_disposition' && <p>For disposition, link the approved schedule and inventory first. A separate officer authorises the
                            decision. The custodian checks holds again before acting in the source system and returns an
                            execution receipt for independent verification. Advancing a case does not delete data.</p>}
                        <Label htmlFor="opening-reference">External case reference</Label>
                        <Input id="opening-reference" name="reference" required maxLength={64}
                            aria-invalid={errors.reference ? true : undefined} aria-describedby="reference-format" />
                        <small id="reference-format">{errors.reference && `${errors.reference} `}Use letters, numbers, underscores or hyphens only.</small>
                        <Label htmlFor="opening-subject">Affected account UUID (required except for breaches)</Label>
                        <Input id="opening-subject" name="subject_id" aria-invalid={errors.subject_id ? true : undefined}
                            aria-describedby="opening-subject-help" />
                        <small id="opening-subject-help" className={errors.subject_id ? 'text-destructive' : undefined}>
                            Enter the affected account’s existing UUID from the restricted case system.
                        </small>
                        <Button disabled={processing}>
                            Open case
                        </Button>
                        {recentlySuccessful && <p role="status">Case opened.</p>}
                    </fieldset>
                )}
            </Form></CardContent></Card>
            <h2 className="text-xl font-semibold">Continue a case</h2>
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
                    <Collapsible>
                        <CollapsibleTrigger asChild><Button type="button" variant="outline">Decision history</Button></CollapsibleTrigger>
                        <CollapsibleContent>
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
                    </CollapsibleContent>
                    </Collapsible>
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
                                    <Button variant="outline" className="justify-self-start" disabled={processing}>
                                        Record {label(row.next!)}
                                    </Button>
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
