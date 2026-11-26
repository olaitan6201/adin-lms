import { Action } from '@/components/ui/controls/Action';
import { Card } from '@/components/ui/layout/Card';
import { Ring } from '@/components/ui/data-display/Ring';
import { status } from '@/components/registry/Records';

type Summary = { scope: string; coursesInScope: number; passed: number; watch: number; failed: number; checksRun: number };

export function ComplianceRun({ summary, lastRun, runChecks }: { summary: Summary; lastRun: string; runChecks: () => void }) {
    const metrics = [
        ['Courses in scope', summary.coursesInScope, 'text-ink-900'],
        ['Passed', summary.passed, 'text-brand-700'],
        ['Needs attention', summary.watch, 'text-amber-700'],
        ['Failed', summary.failed, 'text-rose-700'],
    ] as const;

    return (
        <Card
            title="Compliance run"
            subtitle={summary.scope}
            actions={
                <>
                    {status(`Last run ${lastRun}`)}
                    <Action icon="refresh" size="sm" onClick={runChecks}>
                        Run checks again
                    </Action>
                </>
            }
        >
            <div className="flex flex-wrap items-center gap-6 [&_[role=img]_.text-ink-500]:text-ink-400">
                <Ring
                    value={Math.round((summary.passed / summary.checksRun) * 100)}
                    label="Checks passed"
                    sublabel={`${summary.checksRun} run`}
                />
                <div className="grid min-w-0 flex-1 grid-cols-2 gap-4 sm:grid-cols-4">
                    {metrics.map(([label, value, tone]) => (
                        <div key={label} className="rounded-xl border border-ink-100 p-3.5">
                            <p className="text-[11px] font-medium uppercase tracking-wide text-ink-400">{label}</p>
                            <p className={`tnum mt-1 text-2xl font-semibold tracking-[-0.02em] ${tone}`}>{value}</p>
                        </div>
                    ))}
                </div>
            </div>
        </Card>
    );
}
