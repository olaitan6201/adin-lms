import { Form } from '@inertiajs/react';
import type { ReactNode } from 'react';

export function EntryForm({
    action,
    label,
    children,
}: {
    action: string;
    label: string;
    children?: ReactNode;
}) {
    return (
        <Form
            action={action}
            method="post"
            className="my-4 grid max-w-xl gap-3 [&_input]:border [&_select]:border [&_textarea]:border [&_label]:grid"
            transform={(data) => {
                const result = { ...data };
                for (const field of ['starts_at', 'ends_at', 'opens_at', 'closes_at']) {
                    if (typeof result[field] === 'string' && result[field]) {
                        result[field] = new Date(result[field]).toISOString();
                    }
                }

                return result;
            }}
        >
            {({ errors, processing, recentlySuccessful }) => (
                <>
                    {children}
                    {Object.entries(errors).map(([field, message]) => (
                        <p role="alert" key={field}>
                            {field}: {message}
                        </p>
                    ))}
                    <button className="w-fit rounded border px-3 py-2" disabled={processing}>
                        {processing ? 'Saving…' : label}
                    </button>
                    {recentlySuccessful && <span role="status">Saved.</span>}
                </>
            )}
        </Form>
    );
}

export function localInput(value?: string | null) {
    if (!value) {
        return '';
    }

    const date = new Date(value);
    return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
}
