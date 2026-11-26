import { useId, type ChangeEvent, type ReactNode } from 'react';
import { Icon } from '@/components/icons/Icon';
import { Badge } from '@/components/ui/data-display/Badge';
import { Card } from '@/components/ui/layout/Card';
import { MountedDialog } from '@/components/ui/overlays/MountedDialog';
import type { FieldSpec } from '@/types/assessments/fields';

interface SectionsProps {
    labels: string[];
    counts?: number[];
    active: number;
    change: (index: number) => void;
}

export function Sections({ labels, counts = [], active, change }: SectionsProps) {
    return (
        <Card bodyClassName="p-0">
            <div className="overflow-x-auto border-b border-ink-100" data-scroll>
                <nav aria-label="Page sections" className="flex min-w-max gap-1">
                    {labels.map((label, index) => {
                        const selected = active === index;
                        const tone = selected ? 'border-brand-600 text-brand-800' : 'border-transparent text-ink-500 hover:text-ink-800';
                        const count = counts[index];

                        return (
                            <button
                                key={label}
                                type="button"
                                aria-current={selected ? 'page' : undefined}
                                onClick={() => change(index)}
                                className={`whitespace-nowrap border-b-2 px-3.5 py-2.5 text-sm font-medium ${tone}`}
                            >
                                {label}
                                {count != null && (
                                    <span className="section-count tnum ml-1.5 rounded-full bg-ink-100 px-1.5 py-0.5 text-[11px] font-semibold text-ink-600">
                                        {count}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </nav>
            </div>
        </Card>
    );
}

export function RecordName({ name, meta }: { name: string; meta: string }) {
    return (
        <div className="min-w-0">
            <p className="truncate font-medium text-ink-800">{name}</p>
            <p className="truncate font-mono text-[11px] text-ink-400">{meta}</p>
        </div>
    );
}

export function Status({ value }: { value: string }) {
    const tone = /open|approved|published|closed register|returned|marked|graded|present|Easy/i.test(value) ? 'emerald'
        : /late|moderation|awaiting|pending|restricted|flagged|not submitted|Medium/i.test(value) ? 'amber'
        : /scheduled|submitted|MCQ/i.test(value) ? 'sky' : 'slate';
    const label = value === 'moderation' ? 'In moderation' : value.charAt(0).toUpperCase() + value.slice(1);

    return <Badge tone={tone}>{label}</Badge>;
}

export function Note({ children, amber = false }: { children: ReactNode; amber?: boolean }) {
    const tone = amber ? 'border-amber-200 bg-amber-50/70 text-amber-900' : 'border-sky-200 bg-sky-50/70 text-sky-900';

    return (
        <div className={`flex items-start gap-2.5 rounded-xl border px-3.5 py-3 text-[13px] leading-relaxed ${tone}`}>
            <Icon name={amber ? 'alert' : 'info'} className="mt-0.5 size-4 shrink-0" />
            <span>{children}</span>
        </div>
    );
}

interface DrawerProps {
    title: string;
    subtitle?: string;
    close: () => void;
    children: ReactNode;
}

export function Drawer({ title, subtitle, close, children }: DrawerProps) {
    const id = useId();

    return (
        <MountedDialog
            labelledBy={id}
            close={close}
            className="fixed inset-y-0 right-0 left-auto m-0 h-dvh max-h-dvh w-full max-w-xl overflow-auto bg-white p-0 text-slate-800 shadow-xl backdrop:bg-slate-900/45"
        >
            <header className="sticky top-0 z-10 flex items-start justify-between gap-3 border-b border-ink-100 bg-white px-5 py-4">
                <div>
                    <h2 id={id} className="text-[15px] font-semibold">{title}</h2>
                    <p className="mt-0.5 text-[13px] text-ink-500">{subtitle}</p>
                </div>
                <button type="button" className="btn btn-ghost btn-sm" aria-label="Close panel" onClick={close}>
                    <Icon name="close" className="size-4" />
                </button>
            </header>
            <div className="space-y-4 p-5">{children}</div>
        </MountedDialog>
    );
}

export type { FieldSpec } from '@/types/assessments/fields';
export type Values = Record<string, string>;
export const inputClass = 'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800';

interface FieldsProps {
    fields: FieldSpec[];
    values: Values;
    change: (values: Values) => void;
}

function FieldInput({ field, value, change }: { field: FieldSpec; value: string; change: (value: string) => void }) {
    const props = {
        className: inputClass,
        value,
        required: field.required,
        onChange: (event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => change(event.target.value),
    };

    if (field.options) {
        return (
            <select {...props}>
                {field.options.map(option => <option key={option}>{option}</option>)}
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
            {fields.map(field => (
                <label key={field.label} className="grid gap-1.5 text-sm font-medium">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-500">{field.label}</span>
                    <FieldInput
                        field={field}
                        value={values[field.label] ?? field.initial ?? field.options?.[0] ?? ''}
                        change={value => change({ ...values, [field.label]: value })}
                    />
                </label>
            ))}
        </div>
    );
}

export function Details({ items }: { items: [string, ReactNode][] }) {
    return (
        <dl className="divide-y divide-ink-100">
            {items.map(([label, value]) => (
                <div key={label} className="flex items-center justify-between gap-3 py-2.5 text-[13px]">
                    <dt className="text-ink-600">{label}</dt>
                    <dd className="text-right font-medium text-ink-800">{value}</dd>
                </div>
            ))}
        </dl>
    );
}

export { exportSheet } from '@/lib/csv';
