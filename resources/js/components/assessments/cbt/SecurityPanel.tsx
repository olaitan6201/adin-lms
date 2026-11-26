import { Action } from '@/components/ui/controls/Action';
import { Card } from '@/components/ui/layout/Card';
import type { LogEntry } from '@/types/assessments/cbt';
import { exportSheet } from '@/lib/csv';
import { Checks } from '../Editor';

export const guards = [
    'Identity check against the registered candidate',
    'Invigilator present for the full access window',
    'Random draw of questions per attempt, options shuffled',
    'Browser restrictions where the device supports them',
    'Additional time for approved accommodations',
];

export function SecurityPanel({
    selected,
    change,
    invigilationLog,
}: {
    invigilationLog: LogEntry[];
    selected: string[];
    change: (v: string[]) => void;
}) {
    return (
        <div className="grid gap-5 lg:grid-cols-2">
            <Card
                title="Invigilation log"
                subtitle="Sample records of identity checks, browser events and submissions"
                actions={
                    <Action
                        size="sm"
                        onClick={() =>
                            exportSheet(
                                'invigilation-log',
                                ['Time', 'Event', 'Actor', 'Level'],
                                invigilationLog.map((r) => [r.time, r.event, r.actor, r.level]),
                            )
                        }
                    >
                        Full log
                    </Action>
                }
            >
                <ol className="divide-y divide-slate-100">
                    {invigilationLog.map((r) => (
                        <li key={r.time} className="flex gap-3 py-3">
                            <span
                                className={`mt-2 size-2 shrink-0 rounded-full ${r.level === 'warn' ? 'bg-amber-500' : 'bg-emerald-500'}`}
                            />
                            <div>
                                {r.event}
                                <small className="block text-slate-500">
                                    {r.time} · {r.actor}
                                </small>
                            </div>
                        </li>
                    ))}
                </ol>
            </Card>
            <Card
                title="Controls applied to a sitting"
                subtitle="Identity, invigilation, question design and browser restrictions"
            >
                <Checks labels={guards} selected={selected} change={change} />
                <p className="mt-3 text-xs text-slate-600">
                    These sample settings do not monitor a device or record new events.
                </p>
            </Card>
        </div>
    );
}
