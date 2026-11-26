import { NativeSelectOption } from '@/components/ui/native-select';
import { ValidatedInput, ValidatedSelect } from './ValidatedFields';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { FormFeedback } from '@/components/forms/FormFeedback';
import { Form } from '@inertiajs/react';
import type { ReactNode } from 'react';

interface PostProps {
    url: string;
    button: string;
    children?: ReactNode;
}

export function Post({ url, button, children }: PostProps) {
    return (
        <Form action={url} method="post" className="grid min-w-0 gap-4 py-2 [&_button:not([role])]:h-auto [&_button:not([role])]:min-h-9 [&_button:not([role])]:max-w-full [&_button:not([role])]:w-fit [&_button:not([role])]:whitespace-normal">
            {({ processing, errors, recentlySuccessful }) => (
                <FormFeedback errors={errors}>
                    {children}
                    <Button type="submit" disabled={processing}>{processing ? 'Saving…' : button}</Button>
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
        <Label className="grid min-w-0 gap-2 leading-normal">
            {label}
            <ValidatedInput
                name={name}
                type={type}
                defaultValue={value}
                required={!optional}
                step={type === 'number' ? 'any' : undefined}
            />
        </Label>
    );
}

interface CheckProps {
    name: string;
    label: string;
}

export function Check({ name, label }: CheckProps) {
    return (
        <Label className="flex items-center gap-3 leading-normal">
            <Checkbox name={name} value="1" />
            {label}
        </Label>
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
        <Label className="grid min-w-0 gap-2 leading-normal">
            Learner
            <ValidatedSelect name="enrolment" required>
                {members.map((m) => (
                    <NativeSelectOption key={m.id} value={m.id}>
                        {m.name}
                    </NativeSelectOption>
                ))}
            </ValidatedSelect>
        </Label>
    );
}
