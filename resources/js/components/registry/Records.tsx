import type { ReactNode } from 'react';
import { Badge } from '@/components/ui/data-display/Badge';
import { Card } from '@/components/ui/layout/Card';
import { Table } from '@/components/ui/data-display/Table';
export { Progress, Metrics } from './RecordMeasures';

export function status(text: string, tone?: string) {
    return (
        <Badge
            tone={
                tone ??
                {
                    active: 'emerald',
                    approved: 'emerald',
                    published: 'emerald',
                    pass: 'emerald',
                    done: 'emerald',
                    supported: 'emerald',
                    configured: 'sky',
                    connected: 'emerald',
                    pending: 'amber',
                    open: 'amber',
                    suspended: 'rose',
                    fail: 'rose',
                    draft: 'amber',
                    planned: 'sky',
                    watch: 'amber',
                    partial: 'amber',
                }[text.toLowerCase()] ??
                'slate'
            }
        >
            {text}
        </Badge>
    );
}

export const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
export const val = (data: FormData, key: string) => String(data.get(key) ?? '').trim();
export function Records({
    title,
    subtitle,
    columns,
    rows,
    actions,
    children,
    tableClass,
    footer,
    bodyClassName,
}: {
    title: string;
    subtitle?: string;
    columns: string[];
    rows: ReactNode[][];
    actions?: ReactNode;
    children?: ReactNode;
    tableClass?: string;
    footer?: ReactNode;
    bodyClassName?: string;
}) {
    const displayRows = columns.at(-1) === ''
        ? rows.map((row) => [
              ...row.slice(0, -1),
              <div key="actions" className="flex justify-end gap-1.5">
                  {row.at(-1)}
              </div>,
          ])
        : rows;

    return (
        <Card {...{ title, subtitle, actions, bodyClassName }}>
            {children}
            <div className={`[&_.tbl]:leading-[1.25rem] [&_.tbl_.btn-sm]:leading-[1.25rem] ${tableClass ?? ''}`}>
                <Table columns={columns} rows={displayRows} empty="No matching records." />
            </div>
            {footer}
        </Card>
    );
}

export function Details({ entries }: { entries: [string, ReactNode][] }) {
    return (
        <dl className="divide-y divide-ink-100 text-[13px]">
            {entries.map(([k, v]) => (
                <div key={k} className="flex items-start justify-between gap-6 py-2.5">
                    <dt className="text-slate-500">{k}</dt>
                    <dd className="text-right font-medium text-ink-800">{v}</dd>
                </div>
            ))}
        </dl>
    );
}
