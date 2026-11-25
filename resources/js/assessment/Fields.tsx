import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { NativeSelect } from '@/components/ui/native-select';
import { FormFeedback } from '@/components/ui/form-feedback';
import { Form } from '@inertiajs/react';
import type { ReactNode } from 'react';

interface PostProps {
    url: string;
    button: string;
    children?: ReactNode;
}

export function Post({ url, button, children }: PostProps) {
    return (
        <Form action={url} method="post">
            {({ processing, errors, recentlySuccessful }) => (
                <FormFeedback errors={errors}>
                    {children}
                    <Button disabled={processing}>{processing ? 'Saving…' : button}</Button>
                    <p aria-live="polite">{recentlySuccessful ? 'Saved.' : ''}</p>
                </FormFeedback>
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
            <Input
                name={name}
                type={type}
                defaultValue={value}
                required={!optional}
                step={type === 'number' ? 'any' : undefined}
            />
        </label>
    );
}

interface CheckProps {
    name: string;
    label: string;
}

export function Check({ name, label }: CheckProps) {
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

export type Member = {
    id: string;
    name: string;
};
export function Roster({ members }: { members: Member[] }) {
    return (
        <label>
            Learner
            <NativeSelect name="enrolment" required>
                {members.map((m) => (
                    <option key={m.id} value={m.id}>
                        {m.name}
                    </option>
                ))}
            </NativeSelect>
        </label>
    );
}
