import { Card } from '@/components/ui/layout/Card';
import { Badge } from '@/components/ui/data-display/Badge';
import { Action } from '@/components/ui/controls/Action';
import { Table } from '@/components/ui/data-display/Table';
import { HorizontalBars } from './HorizontalBars';
import type { AdminOverviewData } from '@/types/insights/adminOverview';

export function ServiceHealth({ service }: { service: AdminOverviewData['service'] }) {
    return (
        <Card title="Service health">
            {service.metrics.length > 0 && <HorizontalBars items={service.metrics} />}
            <p className="rounded-xl bg-ink-50 p-3.5 text-sm text-ink-600">{service.note}</p>
        </Card>
    );
}

export function Approvals({ approvals }: { approvals: AdminOverviewData['approvals'] }) {
    return (
        <Card
            title="Approval queue"
            subtitle="Items you can review with your current permissions"
            className="[&_.tbl_th]:text-ink-500"
        >
            <Table
                columns={['Item', 'Details', 'Status', 'Action']}
                empty="No items are waiting for your review."
                rowKeys={approvals.map(item => item.id)}
                rows={approvals.map(item => [
                    item.title,
                    item.meta,
                    <Badge key="status" tone="amber">{item.status}</Badge>,
                    <Action
                        key="action"
                        href={item.href}
                        size="sm"
                        aria-label={`Review ${item.title}`}
                    >
                        Review
                    </Action>,
                ])}
            />
        </Card>
    );
}

export function RecentActivity({ activity }: { activity: AdminOverviewData['activity'] }) {
    return (
        <Card title="Recent activity">
            {activity.length ? (
                <ol className="grid grid-cols-1 gap-x-8 gap-y-4 border-l border-ink-100 pl-5 lg:grid-cols-2">
                    {activity.map(event => (
                        <li key={event.id} className="relative">
                            <span className="absolute -left-[25px] top-1.5 size-2.5 rounded-full border-2 border-white bg-brand-500" />
                            <p className="text-[13px] leading-relaxed text-ink-700">
                                <strong>{event.who}</strong> {event.action}
                            </p>
                            <p className="text-xs text-ink-600">{event.when}</p>
                        </li>
                    ))}
                </ol>
            ) : (
                <p className="text-sm text-ink-600">No recent academic activity is available.</p>
            )}
        </Card>
    );
}
