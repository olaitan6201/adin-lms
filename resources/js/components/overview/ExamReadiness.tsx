import { Badge } from '@/components/ui/data-display/Badge';
import { Card } from '@/components/ui/layout/Card';

const bank = [
    { label: 'Objective', value: 118, color: '#10B981' },
    { label: 'Short answer', value: 42, color: '#33475F' },
    { label: 'Essay', value: 24, color: '#F59E0B' },
];
const total = bank.reduce((sum, b) => sum + b.value, 0);

function Coverage() {
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

export function ExamReadiness() {
    return <Card title="Examination readiness" subtitle="Objective bank coverage for the two upcoming examinations">
        <div className="space-y-4">
            {[['ACC302', '18 Nov 2026, 09:00 · 68 candidates'], ['BSC205', '21 Nov 2026, 13:00 · 54 candidates']].map(([code, meta]) =>
                <div key={code} className="flex items-center justify-between gap-3 rounded-xl bg-ink-50 p-3.5">
                    <div className="min-w-0"><p className="text-[13px] font-semibold text-ink-800">{code} mid-term</p><p className="mt-0.5 text-xs text-ink-500">{meta}</p></div>
                    <Badge tone="sky">Scheduled</Badge></div>)}
            <div className="rounded-xl border border-ink-100 p-3.5"><p className="text-[12px] font-semibold text-ink-700">Bank coverage</p>
                <div className="mt-2 flex items-center gap-4"><Coverage/></div></div>
        </div>
    </Card>;
}
