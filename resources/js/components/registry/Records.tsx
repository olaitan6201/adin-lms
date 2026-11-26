import type { ReactNode } from 'react';
import { Badge } from '@/components/ui/data-display/Badge';
import { Card } from '@/components/ui/layout/Card';
import { Table } from '@/components/ui/data-display/Table';

export function status(text: string, tone?: string) {
    return <Badge tone={tone ?? ({
        active: 'emerald', approved: 'emerald', published: 'emerald', pass: 'emerald', done: 'emerald',
        supported: 'emerald', configured: 'sky', connected: 'emerald', pending: 'amber', open: 'amber',
        suspended: 'rose', fail: 'rose', draft: 'amber', planned: 'sky', watch: 'amber', partial: 'amber',
    }[text.toLowerCase()] ?? 'slate')}>{text}</Badge>;
}
export const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
export const val = (data: FormData, key: string) => String(data.get(key) ?? '').trim();
export function Records({ title, subtitle, columns, rows, actions, children }: {
    title: string; subtitle?: string; columns: string[]; rows: ReactNode[][]; actions?: ReactNode; children?: ReactNode;
}) {
    return <Card {...{ title, subtitle, actions }}>{children}<Table {...{ columns, rows }} empty="No matching records." /></Card>;
}
export function Details({ entries }: { entries: [string, ReactNode][] }) {
    return <dl className="divide-y divide-slate-100 text-[13px]">{entries.map(([k,v]) => <div key={k} className="flex items-center justify-between gap-3 py-2"><dt className="text-slate-500">{k}</dt><dd className="font-medium">{v}</dd></div>)}</dl>;
}
export function Progress({ n }: { n: number }) {
    return <span className="flex w-28 items-center gap-2"><span className="prog-track flex-1" role="progressbar" aria-label="Completion" aria-valuemin={0} aria-valuemax={100} aria-valuenow={n}><span className="prog-fill block" style={{ width: `${n}%` }}/></span><span className="text-[11px] font-medium text-ink-600">{n}%</span></span>;
}
export function Metrics({ rows }: { rows: [string,string,string?][] }) {
    return <div className={`mb-4 grid gap-3 ${rows.length === 4 ? 'sm:grid-cols-4' : 'sm:grid-cols-3'}`}>{rows.map(([label,value,hint]) => <div key={label} className="rounded-xl border border-slate-100 p-3.5">
        <p className="text-[11px] font-semibold uppercase text-slate-500">{label}</p><p className="mt-1 font-semibold">{value}</p><small className="text-slate-500">{hint}</small></div>)}</div>;
}
