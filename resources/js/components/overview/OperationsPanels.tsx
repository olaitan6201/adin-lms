import { useWorkspaceOverlays } from '@/layouts/workspace/WorkspaceOverlays';
import type { ServiceMetric, Approval } from './panelTypes';
import { Action } from '@/components/ui/controls/Action';
import { Badge } from '@/components/ui/data-display/Badge';
import { Card } from '@/components/ui/layout/Card';
import { Table } from '@/components/ui/data-display/Table';

export function ServiceHealth({
    performanceMetrics,
    backup,
}: {
    performanceMetrics: readonly ServiceMetric[];
    backup: string;
}) {
    return (
        <Card title="Service health" subtitle="Live operational targets against the agreed service levels">
            <ul className="divide-y divide-ink-100">
                {performanceMetrics.map((m) => (
                    <li key={m.metric} className="flex items-center justify-between gap-3 py-2.5">
                        <span className="text-[13px] text-ink-600">{m.metric}</span>
                        <span className="flex shrink-0 items-center gap-2">
                            <span className="whitespace-nowrap text-[13px] font-semibold text-ink-800 tnum">
                                {m.value}
                            </span>
                            <Badge tone={m.state === 'good' ? 'emerald' : 'amber'}>
                                {m.state === 'good' ? 'On target' : 'Watch'}
                            </Badge>
                        </span>
                    </li>
                ))}
            </ul>
            <div className="mt-4 rounded-xl bg-ink-50 p-3.5">
                <p className="text-[12px] font-semibold text-ink-700">Nightly backup</p>
                <p className="mt-0.5 text-xs text-ink-500">{backup}</p>
            </div>
        </Card>
    );
}

type ApprovalQueueProps = {
    approvals: readonly Approval[];
};

export function ApprovalQueue({ approvals }: ApprovalQueueProps) {
    const { openDrawer } = useWorkspaceOverlays();

    function review(item: Approval) {
        openDrawer({
            title: item.item,
            description: `${item.kind} · ${item.level} priority`,
            content: <p>Requested by {item.requester}. Waiting: {item.age}. This sample is awaiting a decision.</p>,
        });
    }

    return (
        <Card
            className="overview-actions-wide"
            title="Approval queue"
            subtitle="Items waiting on a decision from an authorised role"
            actions={<Badge tone="amber">{approvals.length} open</Badge>}
        >
            <Table
                columns={['Item', 'Type', 'Requested by', 'Waiting', 'Action']}
                empty="Nothing is waiting for approval."
                rows={approvals.map((a) => [
                    <div key="item" className="flex items-center gap-2">
                        <span
                            className={`size-1.5 shrink-0 rounded-full ${a.level === 'high' ? 'bg-rose-500' : 'bg-amber-500'}`}
                        />
                        <span className="font-medium text-ink-800">{a.item}</span>
                    </div>,
                    <Badge key="kind" tone="slate">
                        {a.kind}
                    </Badge>,
                    <span key="requester" className="text-[13px] text-ink-500">
                        {a.requester}
                    </span>,
                    <span key="waiting" className="text-[13px] text-ink-500">
                        {a.age}
                    </span>,
                    <Action
                        key="review"
                        variant="outline"
                        size="sm"
                        onClick={() => review(a)}
                    >
                        Review
                    </Action>,
                ])}
            />
        </Card>
    );
}
