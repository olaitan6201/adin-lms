import { useId, useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CorrectionFocus } from '../OperationsFields';
import { approveCase } from './approveCase';
import { executeApproval } from './executeApproval';
import { referIncident } from './referIncident';
import type { OperationChoice, Receipt } from './privacyOperation';
import { submitPrivacyAction, type PrivacyMode } from './submitPrivacyAction';

export type { OperationChoice } from './privacyOperation';

const modes = {
    approve: approveCase,
    execute: executeApproval,
    refer: referIncident,
};

interface PrivacyActionProps {
    mode: PrivacyMode;
    csrf: string;
    operations: OperationChoice[];
}

export default function PrivacyAction({ mode, csrf, operations }: PrivacyActionProps) {
    const id = useId();
    const operation = modes[mode];
    const Fields = operation.Fields;
    const [busy, setBusy] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [result, setResult] = useState<Receipt | null>(null);

    async function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (busy) {
            return;
        }

        const fields = new FormData(event.currentTarget);
        setErrors({});
        setResult(null);
        setBusy(true);
        try {
            const outcome = await submitPrivacyAction(operation, csrf, fields);
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
        <Card
            role="region"
            aria-labelledby={`${id}-title`}
            className="min-w-0 space-y-3"
        >
            <CardContent className="grid gap-3">
                <h2
                    id={`${id}-title`}
                    className="text-xl font-semibold"
                >
                    {operation.heading}
                </h2>
                <p>{operation.description}</p>
                <form
                    id={id}
                    className="grid gap-3"
                    onSubmit={submit}
                    onChange={() => setResult(null)}
                >
                    <CorrectionFocus errors={errors} />
                    <Fields
                        errors={errors}
                        operations={operations}
                    />
                    <Button
                        variant={operation.variant}
                        disabled={busy}
                    >
                        {operation.action}
                    </Button>
                    {errors.form && <p role="alert">{errors.form}</p>}
                    {result && (
                        <>
                            <p role="status">{result.message}</p>
                            {result.details && (
                                <pre className="whitespace-pre-wrap break-all">{result.details}</pre>
                            )}
                        </>
                    )}
                </form>
            </CardContent>
        </Card>
    );
}
