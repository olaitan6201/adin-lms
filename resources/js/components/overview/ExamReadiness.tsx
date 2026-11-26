import type { Exam, MetricBar } from './panelTypes';
import { Badge } from '@/components/ui/data-display/Badge';
import { Card } from '@/components/ui/layout/Card';

function Coverage({ bank }: { bank: readonly MetricBar[] }) {
    const total = bank.reduce((sum, b) => sum + b.value, 0);
    return <div className="flex items-center gap-6">
        <div className="relative size-[108px] shrink-0">
            <svg viewBox="0 0 108 108" className="size-full" role="img" aria-label="Breakdown">
                {bank.map((b, i) => <circle key={b.label} cx="54" cy="54" r="46" fill="none" stroke={b.color} strokeWidth="16"
                    pathLength={total} strokeDasharray={`${b.value} ${total - b.value}`} strokeDashoffset={-bank.slice(0, i).reduce((n, s) => n + s.value, 0)}
                    transform="rotate(-90 54 54)"><title>{b.label}: {b.value}</title></circle>)}
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xl font-semibold text-ink-900 tnum">{total}</span>
                <span className="text-[10px] font-medium uppercase tracking-wide text-ink-400">Questions</span></div>
        </div>
        <ul className="min-w-0 flex-1 space-y-2">{bank.map(b => <li key={b.label} className="flex items-center gap-2 text-[13px]">
            <span className="size-2.5 shrink-0 rounded-sm" style={{ background: b.color }}/><span className="min-w-0 flex-1 truncate text-ink-600">{b.label}</span>
            <span className="font-semibold text-ink-800 tnum">{b.value}</span></li>)}</ul>
    </div>;
}

export function ExamReadiness({ bank, exams, subtitle }: { bank: readonly MetricBar[]; exams: readonly Exam[]; subtitle: string }) {
    return <Card title="Examination readiness" subtitle={subtitle}>
        <div className="space-y-4">
            {exams.map(({ title, meta, status }) =>
                <div key={title} className="flex items-center justify-between gap-3 rounded-xl bg-ink-50 p-3.5">
                    <div className="min-w-0"><p className="text-[13px] font-semibold text-ink-800">{title}</p><p className="mt-0.5 text-xs text-ink-500">{meta}</p></div>
                    <Badge tone="sky">{status}</Badge></div>)}
            <div className="rounded-xl border border-ink-100 p-3.5"><p className="text-[12px] font-semibold text-ink-700">Bank coverage</p>
                <div className="mt-2 flex items-center gap-4"><Coverage bank={bank}/></div></div>
        </div>
    </Card>;
}
