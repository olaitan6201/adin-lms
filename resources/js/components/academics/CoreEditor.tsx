import type { ReactNode } from 'react';
import RecordForm, { type Field } from './RecordForm';

export function CoreEditor({ title, submit, action, fields, method, description }: {
    title: string;
    submit: string;
    action: string;
    fields?: Field[];
    method?: 'post' | 'patch';
    description?: ReactNode;
}) {
    return (
        <details className="min-w-0 border-t border-border">
            <summary className="min-h-11 cursor-pointer py-3 text-sm font-medium hover:underline focus-visible:outline-ring">
                {title}
            </summary>
            {description && <p className="mb-2 text-sm text-muted-foreground">{description}</p>}
            <RecordForm
                title={submit}
                action={action}
                fields={fields}
                method={method}
                resetOnSuccess={method !== 'patch'}
                preserveScroll
            />
        </details>
    );
}
