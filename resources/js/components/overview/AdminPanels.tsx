import type { MetricBar, ActivityEntry } from './panelTypes';
import { Badge } from '@/components/ui/data-display/Badge';
import { Card } from '@/components/ui/layout/Card';
import { AreaChart, DeliveryColumns, HorizontalBars } from './Charts';
import { Go } from './OverviewParts';
export { ServiceHealth, ApprovalQueue } from './OperationsPanels';

export function Enrolment({
    session,
    labels,
    series,
}: {
    session: string;
    labels: readonly string[];
    series: {
        values: readonly number[];
        color: string;
    };
}) {
    return (
        <Card
            title="Enrolment over the session"
            subtitle="Registered students at each month end"
            actions={
                <>
                    <Badge tone="emerald">{session}</Badge>
                    <Go to="admin/structure" icon="external">
                        Academic structure
                    </Go>
                </>
            }
        >
            <AreaChart {...series} labels={labels} height={250} label="Registered students over the session" />
        </Card>
    );
}

type DeliveryProps = {
    labels: readonly string[];
    values: readonly number[];
};

export function Delivery({ labels, values }: DeliveryProps) {
    return (
        <Card
            title="Course delivery activity"
            subtitle="Active course offerings at each month end"
            actions={<Badge tone="emerald">{values.at(-1) ?? 0} live</Badge>}
        >
            <DeliveryColumns labels={labels} values={values} />
        </Card>
    );
}

export function Participation({
    completionByFaculty,
    summary,
}: {
    completionByFaculty: readonly MetricBar[];
    summary: string;
}) {
    return (
        <Card
            title="Completion by faculty"
            subtitle="Share of published course material completed by enrolled students"
        >
            <div className="space-y-4">
                <HorizontalBars items={completionByFaculty} />
                <div className="rounded-xl border border-ink-100 p-3.5">
                    <p className="text-[12px] font-semibold text-ink-700">Weakest coverage</p>
                    <p className="mt-1 text-xs leading-relaxed text-ink-500">{summary}</p>
                </div>
            </div>
        </Card>
    );
}

export function Activity({ activityFeed }: { activityFeed: readonly ActivityEntry[] }) {
    return (
        <Card title="Recent activity" subtitle="Audit-worthy events from the last 24 hours">
            <ol className="grid grid-cols-1 gap-x-8 gap-y-4 border-l border-ink-100 pl-5 lg:grid-cols-2">
                {activityFeed.map((a) => (
                    <li className="relative" key={a.who}>
                        <span className="absolute -left-[25px] top-1.5 size-2.5 rounded-full border-2 border-white bg-brand-500" />
                        <p className="text-[13px] leading-relaxed text-ink-700">
                            <span className="font-semibold text-ink-900">{a.who}</span> {a.action}
                        </p>
                        <p className="mt-0.5 text-[11px] text-ink-400">{a.when}</p>
                    </li>
                ))}
            </ol>
        </Card>
    );
}
