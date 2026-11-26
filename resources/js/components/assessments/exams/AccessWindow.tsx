import { Card } from '@/components/ui/layout/Card';
import { Icon } from '@/components/icons/Icon';
import { Details } from '../RecordDetails';
import type { Sitting } from '@/types/assessments/examPaper';

export function AccessWindow({
    remaining,
    stored,
    facts,
}: {
    remaining: number;
    stored: boolean;
    facts: Sitting['facts'];
}) {
    return (
        <Card className="exam-facts" title="Access window">
            <div className="rounded-xl bg-ink-900 p-4 text-white">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-400">
                    Time remaining
                </p>
                <p role="timer" className="tnum mt-1 font-mono text-3xl font-medium tracking-tight">
                    {`${Math.floor(remaining / 60)}`.padStart(2, '0')}:{`${remaining % 60}`.padStart(2, '0')}
                </p>
                <p className="mt-2 text-[11.5px] text-ink-400">Auto-submits at 00:00</p>
            </div>
            <p
                role="status"
                className="my-4 flex items-center justify-between gap-3 rounded-xl border border-ink-100 p-3 text-[12.5px] text-ink-600"
            >
                <span className="flex items-center gap-2">
                    <Icon name="save" className="size-4 text-brand-600" />
                    {stored ? 'All responses saved' : 'Local storage unavailable; keep this page open'}
                </span>
                {stored && <small className="text-[11px] text-ink-400">just now</small>}
            </p>
            <Details
                items={facts.map(([label, value]) => [
                    label,
                    /^\d+$/.test(value) ? <span className="tnum">{value}</span> : value,
                ])}
            />
        </Card>
    );
}
