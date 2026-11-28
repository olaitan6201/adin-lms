import { FormFeedback } from '@/components/forms/FormFeedback';
import { Button } from '@/components/ui/button';
import { RecordField } from './RecordField';
import { Form } from '@inertiajs/react';

export type Choice = {
    id: string;
    name: string;
};

export type Field = {
    name: string;
    label: string;
    options?: Choice[];
    type?: string;
    initial?: string;
    optional?: boolean;
    multiple?: boolean;
    min?: number;
    max?: number;
    inputMode?: 'decimal' | 'numeric';
};

export default function RecordForm({
    title,
    action,
    fields = [],
    method = 'post',
    resetOnSuccess = false,
    preserveScroll = false,
}: {
    title: string;
    action: string;
    fields?: Field[];
    method?: 'post' | 'delete' | 'patch';
    resetOnSuccess?: boolean;
    preserveScroll?: boolean;
}) {
    return (
        <Form
            action={action}
            method={method}
            className="my-3 grid gap-3 border-l-2 border-border pl-4"
            options={{ preserveScroll }}
            resetOnSuccess={resetOnSuccess}
        >
            {({ processing, errors, recentlySuccessful }) => (
                <FormFeedback errors={errors}>
                    {fields.map((f) => (
                        <RecordField key={f.name} field={f} error={errors[f.name]} />
                    ))}
                    <Button variant={method === 'delete' ? 'destructive' : 'default'} disabled={processing}>
                        {title}
                    </Button>
                    {processing && <p role="status">Saving…</p>}
                    {recentlySuccessful && <p role="status">Saved.</p>}
                </FormFeedback>
            )}
        </Form>
    );
}

export const field = (name: string, label: string, options?: Choice[]): Field => ({
    name,
    label,
    options,
});
