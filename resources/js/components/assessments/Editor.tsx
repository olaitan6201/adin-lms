import { useState, type FormEvent, type ChangeEvent, type ReactNode } from 'react';
import type { FieldSpec } from '@/types/assessments/fields';

export type { FieldSpec } from '@/types/assessments/fields';
export type Values = Record<string, string>;
export const inputClass =
    'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800';

interface FieldsProps {
    fields: FieldSpec[];
    values: Values;
    change: (values: Values) => void;
}

function FieldInput({
    field,
    value,
    change,
}: {
    field: FieldSpec;
    value: string;
    change: (value: string) => void;
}) {
    const props = {
        className: inputClass,
        value,
        required: field.required,
        onChange: (event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
            change(event.target.value),
    };

    if (field.options) {
        return (
            <select {...props}>
                {field.options.map((option) => (
                    <option key={option}>{option}</option>
                ))}
            </select>
        );
    }

    if (field.type === 'textarea') {
        return <textarea rows={4} {...props} />;
    }

    return <input type={field.type ?? 'text'} min={field.min} max={field.max} {...props} />;
}

export function Fields({ fields, values, change }: FieldsProps) {
    return (
        <div className="grid gap-4">
            {fields.map((field) => (
                <label key={field.label} className="grid gap-1.5 text-sm font-medium">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-500">
                        {field.label}
                    </span>
                    <FieldInput
                        field={field}
                        value={values[field.label] ?? field.initial ?? field.options?.[0] ?? ''}
                        change={(value) => change({ ...values, [field.label]: value })}
                    />
                </label>
            ))}
        </div>
    );
}

export const submitClass =
    'rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800';

export function Editor({
    fields,
    initial,
    save,
    label = 'Save',
    children,
    formId,
    externalSubmit,
}: {
    fields: FieldSpec[];
    initial?: Values;
    save: (values: Values) => void;
    label?: string;
    children?: ReactNode;
    formId?: string;
    externalSubmit?: boolean;
}) {
    const [values, setValues] = useState<Values>(() => ({
        ...Object.fromEntries(fields.map((f) => [f.label, f.initial ?? f.options?.[0] ?? ''])),
        ...initial,
    }));
    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        save(values);
    }

    return (
        <form id={formId} className="space-y-4" onSubmit={submit}>
            {children}
            <Fields fields={fields} values={values} change={setValues} />
            {!externalSubmit && <button className={submitClass}>{label}</button>}
        </form>
    );
}

export function Checks({
    labels,
    selected,
    change,
}: {
    labels: string[];
    selected: string[];
    change: (next: string[]) => void;
}) {
    function toggle(label: string, checked: boolean) {
        change(checked ? [...selected, label] : selected.filter((value) => value !== label));
    }
    return (
        <div className="space-y-2">
            {labels.map((label) => (
                <label
                    key={label}
                    className="flex items-start gap-3 rounded-lg border border-slate-200 p-3 text-sm"
                >
                    <input
                        type="checkbox"
                        checked={selected.includes(label)}
                        onChange={(e) => toggle(label, e.currentTarget.checked)}
                    />
                    {label}
                </label>
            ))}
        </div>
    );
}
