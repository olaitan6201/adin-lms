import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { createContext, useContext, useEffect, useId, useRef, type ReactNode } from 'react';

type Errors = Record<string, string>;
const Feedback = createContext<{ id: string; errors: Errors } | null>(null);

export function useFieldFeedback(name?: string, description?: string) {
    const context = useContext(Feedback);
    if (!context || !name) return {};
    const key = name.replace(/\[(\w+)\]/g, '.$1').replace(/\[\]$/, '');
    const fields = Object.keys(context.errors).filter((field) => field === key || field.startsWith(`${key}.`));
    if (!fields.length) return {};
    return {
        'aria-invalid': true as const,
        'aria-describedby': [description, ...fields.map((field) => `${context.id}-${field}`)].filter(Boolean).join(' '),
    };
}

function ErrorSummary({ errors, id }: { errors: Errors; id: string }) {
    const summary = useRef<HTMLDivElement>(null);
    useEffect(() => { summary.current?.focus(); }, [errors]);
    return (
        <Alert variant="destructive" ref={summary} role="group" aria-labelledby={`${id}-title`} tabIndex={-1}>
            <AlertTitle id={`${id}-title`}>Check your entries</AlertTitle>
            <AlertDescription>
                <ul>{Object.entries(errors).map(([field, message]) => (
                    <li key={field} id={`${id}-${field}`}>{message}</li>
                ))}</ul>
            </AlertDescription>
        </Alert>
    );
}

export function FormFeedback({ errors, children }: { errors: Errors; children: ReactNode }) {
    const id = useId();
    return (
        <Feedback.Provider value={{ id, errors }}>
            {Object.keys(errors).length > 0 && <ErrorSummary id={id} errors={errors} />}
            {children}
        </Feedback.Provider>
    );
}
