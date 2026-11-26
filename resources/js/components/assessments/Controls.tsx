import type { FieldSpec } from '@/types/assessments/fields';
import { useId, type ReactNode } from 'react';
import { useMountedDialog } from '@/components/ui/overlays/useMountedDialog';
import { Action } from '@/components/ui/controls/Action';
import { Badge } from '@/components/ui/data-display/Badge';
import { Card } from '@/components/ui/layout/Card';
import { Icon } from '@/components/icons/Icon';

export function Sections({ labels, counts = [], active, change }: { labels: string[]; counts?: number[]; active: number; change: (n: number) => void }) {
    return <Card bodyClassName="p-0"><div className="overflow-x-auto border-b border-ink-100" data-scroll><nav aria-label="Page sections" className="flex min-w-max gap-1">
        {labels.map((label, i) => <button key={label} type="button" aria-current={active === i ? 'page' : undefined} onClick={() => change(i)}
            className={`whitespace-nowrap border-b-2 px-3.5 py-2.5 text-sm font-medium ${i === active ? 'border-brand-600 text-brand-800' : 'border-transparent text-ink-500 hover:text-ink-800'}`}>{label}{counts[i] != null && <span className="section-count tnum ml-1.5 rounded-full bg-ink-100 px-1.5 py-0.5 text-[11px] font-semibold text-ink-600">{counts[i]}</span>}</button>)}
    </nav></div></Card>;
}

export function RecordName({ name, meta }: { name: string; meta: string }) {
    return <div className="min-w-0"><p className="truncate font-medium text-ink-800">{name}</p><p className="truncate font-mono text-[11px] text-ink-400">{meta}</p></div>;
}

export function Status({ value }: { value: string }) {
    const tone = /open|approved|published|closed register|returned|marked|graded|present|Easy/i.test(value) ? 'emerald'
        : /late|moderation|awaiting|pending|restricted|flagged|not submitted|Medium/i.test(value) ? 'amber'
        : /scheduled|submitted|MCQ/i.test(value) ? 'sky' : 'slate';
    return <Badge tone={tone}>{value === 'moderation' ? 'In moderation' : value.charAt(0).toUpperCase() + value.slice(1)}</Badge>;
}

export function Note({ children, amber = false }: { children: ReactNode; amber?: boolean }) {
    return <div className={`flex items-start gap-2.5 rounded-xl border px-3.5 py-3 text-[13px] leading-relaxed ${amber ? 'border-amber-200 bg-amber-50/70 text-amber-900' : 'border-sky-200 bg-sky-50/70 text-sky-900'}`}>
        <Icon name={amber ? 'alert' : 'info'} className="mt-0.5 size-4 shrink-0"/><span>{children}</span></div>;
}

export function Drawer({ title, subtitle, close, children }: { title: string; subtitle?: string; close: () => void; children: ReactNode }) {
    const ref = useMountedDialog();
    const id = useId();
    const contents = <><header className="sticky top-0 z-10 flex items-start justify-between gap-3 border-b border-ink-100 bg-white px-5 py-4">
        <div><h2 id={id} className="text-[15px] font-semibold">{title}</h2><p className="mt-0.5 text-[13px] text-ink-500">{subtitle}</p></div>
        <button type="button" className="btn btn-ghost btn-sm" aria-label="Close panel" onClick={close}><Icon name="close" className="size-4"/></button>
    </header><div className="space-y-4 p-5">{children}</div></>;
    return <dialog ref={ref} aria-labelledby={id} onCancel={close} className="fixed inset-y-0 right-0 left-auto m-0 h-dvh max-h-dvh w-full max-w-xl overflow-auto bg-white p-0 text-slate-800 shadow-xl backdrop:bg-slate-900/45">{contents}</dialog>;
}

export type { FieldSpec } from '@/types/assessments/fields';
export type Values = Record<string, string>;
export const inputClass = 'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800';

export function Fields({ fields, values, change }: { fields: FieldSpec[]; values: Values; change: (v: Values) => void }) {
    return <div className="grid gap-4">{fields.map(f => {
        const props = { className: inputClass, value: values[f.label] ?? f.initial ?? f.options?.[0] ?? '', required: f.required,
            onChange: (e: { target: { value: string } }) => change({ ...values, [f.label]: e.target.value }) };
        return <label key={f.label} className="grid gap-1.5 text-sm font-medium"><span className="text-[11px] font-semibold uppercase tracking-wider text-ink-500">{f.label}</span>
            {f.options ? <select {...props}>{f.options.map(o => <option key={o}>{o}</option>)}</select> : f.type === 'textarea' ? <textarea rows={4} {...props} /> : <input type={f.type ?? 'text'} min={f.min} max={f.max} {...props} />}
        </label>;
    })}</div>;
}

export function Details({ items }: { items: [string, ReactNode][] }) {
    return <dl className="divide-y divide-ink-100">{items.map(([label, value]) => <div key={label} className="flex items-center justify-between gap-3 py-2.5 text-[13px]">
        <dt className="text-ink-600">{label}</dt><dd className="text-right font-medium text-ink-800">{value}</dd>
    </div>)}</dl>;
}

export function exportSheet(name: string, columns: string[], rows: (string | number | null)[][]) {
    const csv = [columns, ...rows].map(row => row.map(v => {
        const text = String(v ?? '');
        return `"${(/^\s*[=+@\-\t\r]/.test(text) ? "'" : '') + text.replaceAll('"', '""')}"`;
    }).join(',')).join('\r\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${name}.csv`;
    anchor.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
