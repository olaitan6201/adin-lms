import { Form } from '@inertiajs/react';
import type { ReactNode } from 'react';
export function Post({ url, button, children }: { url: string; button: string; children?: ReactNode }) {
    return (
        <Form action={url} method="post">
            {({ processing, errors, recentlySuccessful }) => (
                <>
                    {children}
                    <button disabled={processing}>{button}</button>
                    <p aria-live="polite">{recentlySuccessful ? 'Saved.' : Object.values(errors).join(' ')}</p>
                </>
            )}
        </Form>
    );
}
export function Field({
    label,
    name,
    type = 'text',
    value,
    optional = false,
}: {
    label: string;
    name: string;
    type?: string;
    value?: string;
    optional?: boolean;
}) {
    return (
        <label>
            {label}
            <input
                name={name}
                type={type}
                defaultValue={value}
                required={!optional}
                step={type === 'number' ? 'any' : undefined}
            />
        </label>
    );
}
export function Check({ name, label }: { name: string; label: string }) {
    return (
        <label>
            <input name={name} type="checkbox" value="1" />
            {label}
        </label>
    );
}
export function WindowFields() {
    return (
        <>
            <Field name="opens_at" type="datetime-local" label="Opens (server time)" />
            <Field name="closes_at" type="datetime-local" label="Closes (server time)" />
        </>
    );
}
export type Member = { id: string; name: string };
export function Roster({ members }: { members: Member[] }) {
    return (
        <label>
            Learner
            <select name="enrolment" required>
                {members.map((m) => (
                    <option key={m.id} value={m.id}>
                        {m.name}
                    </option>
                ))}
            </select>
        </label>
    );
}
