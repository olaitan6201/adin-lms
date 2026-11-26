import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { Form, Link } from '@inertiajs/react';
import { OperationsInput, CorrectionFocus } from '../OperationsFields';
import { OpenPrivacyCase } from '@/components/operations/privacy/OpenPrivacyCase';

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

function PrivacyCaseEntry({ row }: { row: CaseFile }) {
    return (
        <article className="space-y-2 break-words border-t py-3">
            <h3 className="font-semibold">
                {row.reference} · {label(row.kind)}
            </h3>
            <p>
                Stage: {label(row.stage)}. Latest evidence: {row.evidence}.
            </p>
            <p>Responsible officer: {row.owner}</p>
            <Collapsible>
                <CollapsibleTrigger asChild>
                    <Button type="button" variant="outline">
                        Decision history
                    </Button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                    <ol className="space-y-2 py-2">
                        {row.receipts.map((receipt) => (
                            <li key={receipt.id}>
                                {new Date(receipt.time).toLocaleString()} · {label(receipt.stage)} · {receipt.reference}
                                <br />
                                Recorded by {receipt.actor}
                            </li>
                        ))}
                    </ol>
                </CollapsibleContent>
            </Collapsible>
            {row.next && (
                <Form id={`continue-${row.id}`} method="post" action={`/operations/privacy/cases/${row.id}`}>
                    {({ processing, errors }) => (
                        <fieldset className="grid min-w-0 gap-2">
                            <legend>Record next step: {label(row.next!)}</legend>
                            <CorrectionFocus errors={errors} />
                            <input type="hidden" name="stage" value={row.stage} />
                            <OperationsInput
                                label={`Decision or delivery receipt for ${row.reference}`}
                                name="reference"
                                maxLength={64}
                                required
                                error={errors.reference}
                            />
                            {errors.stage && <p role="alert">Reload this case to check its current stage.</p>}
                            <Button variant="outline" className="justify-self-start" disabled={processing}>
                                Record {label(row.next!)}
                            </Button>
                        </fieldset>
                    )}
                </Form>
            )}
        </article>
    );
}

export default function PrivacyCaseRegister({ cases }: { cases: CasePage }) {
    return (
        <section aria-label="Case register" className="card min-w-0 space-y-4 p-5">
            <h2 className="card-title">Case register</h2>
            <p>
                The opening officer owns follow-up. Keep identities, correspondence, deadlines and documents in the restricted case system.
                Enter only its opaque references here.
            </p>
            <OpenPrivacyCase />
            <h2 className="text-xl font-semibold">Continue a case</h2>
            {cases.data.length === 0 && <p>No cases recorded.</p>}
            {cases.data.map((row) => (
                <PrivacyCaseEntry key={row.id} row={row} />
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
