import { useState, type ReactNode } from 'react';
import { Fields, type FieldSpec, type Values } from './Controls';

export const submitClass = 'rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800';

export function Editor({ fields, initial, save, label = 'Save', children }: {
    fields: FieldSpec[]; initial?: Values; save: (values: Values) => void; label?: string; children?: ReactNode;
}) {
    const [values, setValues] = useState<Values>(() => ({
        ...Object.fromEntries(fields.map(f => [f.label, f.initial ?? f.options?.[0] ?? ''])), ...initial,
    }));
    return <form className="space-y-4" onSubmit={e => { e.preventDefault(); save(values); }}>
        {children}<Fields fields={fields} values={values} change={setValues}/><button className={submitClass}>{label}</button>
    </form>;
}

export function Checks({ labels, selected, change }: { labels: string[]; selected: string[]; change: (next: string[]) => void }) {
    return <div className="space-y-2">{labels.map(label => <label key={label} className="flex items-start gap-3 rounded-lg border border-slate-200 p-3 text-sm">
        <input type="checkbox" checked={selected.includes(label)} onChange={e => change(e.target.checked ? [...selected, label] : selected.filter(v => v !== label))}/>{label}
    </label>)}</div>;
}
