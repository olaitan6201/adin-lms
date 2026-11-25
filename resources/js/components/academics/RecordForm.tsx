import { FormFeedback } from '@/components/ui/form-feedback';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { NativeSelect } from '@/components/ui/native-select';
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
};

export default function RecordForm({
    title,
    action,
    fields = [],
    method = 'post',
}: {
    title: string;
    action: string;
    fields?: Field[];
    method?: 'post' | 'delete' | 'patch';
}) {
    return (
        <Form action={action} method={method} className="my-3 grid gap-3 border-l-2 border-teal-800 pl-4">
            {({ processing, errors, recentlySuccessful }) => (
                <FormFeedback errors={errors}>
                    {fields.map((f) => (
                        <label key={f.name}>
                            {f.label}
                            {f.options ? (
                                <NativeSelect
                                    name={f.name}
                                    required={!f.optional}
                                    defaultValue={f.initial ?? ''}
                                >
                                    <option value="">Select an option</option>
                                    {f.options.map((o) => (
                                        <option key={o.id} value={o.id}>
                                            {o.name}
                                        </option>
                                    ))}
                                </NativeSelect>
                            ) : (
                                <Input
                                    type={f.type ?? 'text'}
                                    name={f.name}
                                    defaultValue={f.initial}
                                    required={!f.optional}
                                />
                            )}
                        </label>
                    ))}
                    <Button disabled={processing}>
                        {title}
                    </Button>
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
