import { NativeSelectOption } from '@/components/ui/native-select';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { useId, useState, type FormEvent } from 'react';
import { OperationsInput, OperationsSelect, CorrectionFocus } from '../OperationsFields';

import { submitPrivacyAction, type PrivacyMode } from './submitPrivacyAction';

export type OperationChoice = {
    value: string;
    label: string;
};
const headings = { approve: 'Approve a case action', execute: 'Execute an approval', refer: 'Record an incident referral' };
const actions = { approve: 'Create approval receipt', execute: 'Execute recorded action', refer: 'Record referral' };
const uuid = '[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}';

export default function PrivacyAction({ mode, csrf, operations }: {
    mode: PrivacyMode;
    csrf: string;
    operations: OperationChoice[]
}) {
    const id = useId();
    const [busy, setBusy] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [result, setResult] = useState('');
    const [caseReference, setCaseReference] = useState('');
    const [checkedReceipt, setCheckedReceipt] = useState(false);

    async function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (busy || (mode === 'execute' && !checkedReceipt)) return;

        const fields = new FormData(event.currentTarget);
        setErrors({});
        setResult('');
        setBusy(true);
        try {
            const outcome = await submitPrivacyAction(mode, csrf, fields);
            if ('result' in outcome) {
                setResult(outcome.result);
            } else {
                setErrors(outcome.errors);
            }
        } catch {
            setErrors({ form: 'No confirmation received. Check the case record before trying again.' });
        } finally {
            setBusy(false);
        }
    }

    return (
        <Card role="region" aria-labelledby={`${id}-title`} className="min-w-0 space-y-3">
            <CardContent className="grid gap-3">
                <h2 id={`${id}-title`} className="text-xl font-semibold">
                    {headings[mode]}
                </h2>
                <p>
                    {mode === 'approve'
                        ? 'Verify the case, subject and scope. This records a receipt; it does not run the action.'
                        : mode === 'execute'
                          ? 'Match both identifiers to the case receipt. A different authorised officer must act within 24 hours. Execution releases the approved extract or permanently deletes eligible withdrawn consents.'
                          : 'Contact the privacy lead first. Logging the reference does not send an alert.'}
                </p>
                <form
                    id={id}
                    className="grid gap-3"
                    onSubmit={submit}
                    onChange={(event) => {
                        setResult('');
                        if (!(event.target instanceof HTMLInputElement && event.target.type === 'checkbox')) setCheckedReceipt(false);
                    }}
                >
                    <CorrectionFocus errors={errors} />
                    {mode !== 'refer' && (
                        <OperationsInput name="subject" label="Subject account UUID" error={errors.subject} required pattern={uuid} />
                    )}
                    <OperationsInput
                        name="reference"
                        label={
                            mode === 'refer'
                                ? 'Incident reference'
                                : mode === 'execute'
                                  ? 'Case reference on the approval receipt'
                                  : 'Case reference'
                        }
                        error={errors.reference}
                        maxLength={64}
                        required
                        pattern={'[A-Za-z0-9_\\-]{1,64}'}
                        onChange={(event) => setCaseReference(event.target.value)}
                    />
                    {mode === 'approve' && (
                        <OperationsSelect name="operation" label="Approved scope" error={errors.operation}>
                            {operations.map((item) => (
                                <NativeSelectOption key={item.value} value={item.value}>
                                    {item.label}
                                </NativeSelectOption>
                            ))}
                        </OperationsSelect>
                    )}
                    {mode === 'execute' && (
                        <>
                            <OperationsInput name="approval" label="Approval UUID" error={errors.approval} required pattern={uuid} />
                            <Label className="flex items-baseline gap-2 break-all">
                                <Checkbox
                                    required
                                    checked={checkedReceipt}
                                    onCheckedChange={(value) => setCheckedReceipt(value === true)}
                                />
                                I checked the subject, approval and scope against {caseReference || 'the case'} in the restricted system.
                            </Label>
                        </>
                    )}
                    <Button variant={mode === 'execute' ? 'destructive' : 'outline'} disabled={busy}>
                        {actions[mode]}
                    </Button>
                    {errors.form && <p role="alert">{errors.form}</p>}
                    {result && (
                        <>
                            <p role="status">{mode === 'execute' ? 'Approved action completed.' : result}</p>
                            {mode === 'execute' && <pre className="whitespace-pre-wrap break-all">{result}</pre>}
                        </>
                    )}
                </form>
            </CardContent>
        </Card>
    );
}
