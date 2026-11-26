import { useEffect, useId, useRef, type ReactNode } from 'react';
import { Action } from '@/components/ui/controls/Action';
import { Badge } from '@/components/ui/data-display/Badge';
import { Card } from '@/components/ui/layout/Card';

export function Sections({ labels, active, change }: { labels: string[]; active: number; change: (n: number) => void }) {
    return <Card bodyClassName="p-0"><nav aria-label="Page sections" className="flex flex-wrap px-3">
        {labels.map((label, i) => <button key={i} type="button" aria-current={active === i ? 'page' : undefined} onClick={() => change(i)}
            className={`border-b-2 px-4 py-3 text-sm font-medium ${i === active ? 'border-emerald-700 text-emerald-800' : 'border-transparent text-slate-600'}`}>{label}</button>)}
    </nav></Card>;
}

export function RecordName({ name, meta }: { name: string; meta: string }) {
    return <div><div className="font-medium">{name}</div><small className="font-mono text-slate-500">{meta}</small></div>;
}

export function Status({ value }: { value: string }) {
    const tone = /open|approved|published|closed register|returned|marked|graded|present|Easy/i.test(value) ? 'emerald'
        : /late|moderation|awaiting|pending|restricted|flagged|Medium/i.test(value) ? 'amber'
        : /scheduled|submitted|MCQ/i.test(value) ? 'sky' : 'slate';
    return <Badge tone={tone}>{value}</Badge>;
}

export function Note({ children }: { children: ReactNode }) {
    return <p className="rounded-xl border border-sky-200 bg-sky-50 p-4 text-sm text-sky-900">{children}</p>;
}

export function Drawer({ title, subtitle, close, children }: { title: string; subtitle?: string; close: () => void; children: ReactNode }) {
    const ref = useRef<HTMLDialogElement>(null);
    const id = useId();
    useEffect(() => {
        const dialog = ref.current;
        dialog?.showModal();
        return () => dialog?.close();
    }, []);
    return <dialog ref={ref} aria-labelledby={id} onCancel={close} className="fixed inset-y-0 right-0 left-auto m-0 h-dvh max-h-dvh w-full max-w-xl overflow-auto bg-white p-0 text-slate-800 shadow-xl backdrop:bg-slate-900/45">
        <header className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b bg-white p-5">
            <div><h2 id={id} className="font-semibold">{title}</h2><p className="text-sm text-slate-600">{subtitle}</p></div><Action size="sm" onClick={close}>Close</Action>
        </header><div className="space-y-5 p-5">{children}</div>
    </dialog>;
}

export type FieldSpec = { label: string; options?: string[]; type?: string; initial?: string; required?: boolean; min?: number; max?: number };
export type Values = Record<string, string>;
export const inputClass = 'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800';

export function Fields({ fields, values, change }: { fields: FieldSpec[]; values: Values; change: (v: Values) => void }) {
    return <div className="grid gap-4">{fields.map(f => {
        const props = { className: inputClass, value: values[f.label] ?? f.initial ?? f.options?.[0] ?? '', required: f.required,
            onChange: (e: { target: { value: string } }) => change({ ...values, [f.label]: e.target.value }) };
        return <label key={f.label} className="grid gap-1.5 text-sm font-medium">{f.label}
            {f.options ? <select {...props}>{f.options.map(o => <option key={o}>{o}</option>)}</select> : f.type === 'textarea' ? <textarea rows={4} {...props} /> : <input type={f.type ?? 'text'} min={f.min} max={f.max} {...props} />}
        </label>;
    })}</div>;
}

export function Details({ items }: { items: [string, ReactNode][] }) {
    return <dl className="divide-y divide-slate-100">{items.map(([label, value]) => <div key={label} className="flex items-start justify-between gap-3 py-2.5 text-sm">
        <dt className="text-slate-600">{label}</dt><dd className="text-right font-medium">{value}</dd>
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
