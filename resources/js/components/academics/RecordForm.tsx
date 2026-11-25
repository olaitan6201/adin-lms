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
                <>
                    {fields.map((f) => (
                        <label key={f.name}>
                            {f.label}
                            {f.options ? (
                                <select
                                    name={f.name}
                                    required={!f.optional}
                                    defaultValue={f.initial ?? ''}
                                    className="block w-full rounded border p-2"
                                >
                                    <option value="">Select an option</option>
                                    {f.options.map((o) => (
                                        <option key={o.id} value={o.id}>
                                            {o.name}
                                        </option>
                                    ))}
                                </select>
                            ) : (
                                <input
                                    className="block w-full rounded border p-2"
                                    type={f.type ?? 'text'}
                                    name={f.name}
                                    defaultValue={f.initial}
                                    required={!f.optional}
                                />
                            )}
                        </label>
                    ))}
                    {Object.entries(errors).map(([k, v]) => (
                        <p role="alert" key={k}>
                            {v}
                        </p>
                    ))}
                    <button
                        className="justify-self-start rounded bg-teal-900 px-4 py-2 text-white"
                        disabled={processing}
                    >
                        {title}
                    </button>
                    {recentlySuccessful && <p role="status">Saved.</p>}
                </>
            )}
        </Form>
    );
}

export const field = (name: string, label: string, options?: Choice[]): Field => ({
    name,
    label,
    options,
});
