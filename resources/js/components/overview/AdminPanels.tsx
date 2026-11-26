import { Action } from '@/components/ui/controls/Action';
import { Badge } from '@/components/ui/data-display/Badge';
import { Card } from '@/components/ui/layout/Card';
import { Table } from '@/components/ui/data-display/Table';
import { activityFeed, approvals, completionByFaculty, enrolmentTrend, performanceMetrics } from './adminFixtures';
import { AreaChart, DeliveryColumns, HorizontalBars } from './Charts';
import { Go } from './OverviewParts';

export function Enrolment() {
    return <Card title="Enrolment over the session" subtitle="Registered students at each month end"
        actions={<><Badge tone="emerald">2025/2026</Badge><Go to="admin/structure" icon="external">Academic structure</Go></>}>
        <AreaChart {...enrolmentTrend.series[0]} labels={enrolmentTrend.labels} height={250} label="Registered students over the session"/>
    </Card>;
}

export function ServiceHealth() {
    return <Card title="Service health" subtitle="Live operational targets against the agreed service levels">
        <ul className="divide-y divide-ink-100">{performanceMetrics.map(m => <li key={m.metric} className="flex items-center justify-between gap-3 py-2.5">
            <span className="text-[13px] text-ink-600">{m.metric}</span><span className="flex shrink-0 items-center gap-2">
                <span className="whitespace-nowrap text-[13px] font-semibold text-ink-800 tnum">{m.value}</span>
                <Badge tone={m.state === 'good' ? 'emerald' : 'amber'}>{m.state === 'good' ? 'On target' : 'Watch'}</Badge>
            </span>
        </li>)}</ul>
        <div className="mt-4 rounded-xl bg-ink-50 p-3.5"><p className="text-[12px] font-semibold text-ink-700">Nightly backup</p>
            <p className="mt-0.5 text-xs text-ink-500">Last run 26 Nov 02:00, 41.2 GB written, verification passed. Restore drill due 12 Dec.</p></div>
    </Card>;
}

export function ApprovalQueue({ review }: { review: () => void }) {
    return <Card title="Approval queue" subtitle="Items waiting on a decision from an authorised role" actions={<Badge tone="amber">{approvals.length} open</Badge>}>
        <Table columns={['Item', 'Type', 'Requested by', 'Waiting', 'Action']} empty="Nothing is waiting for approval." rows={approvals.map(a => [
            <div className="flex items-center gap-2"><span className={`size-1.5 shrink-0 rounded-full ${a.level === 'high' ? 'bg-rose-500' : 'bg-amber-500'}`}/>
                <span className="font-medium text-ink-800">{a.item}</span></div>,
            <Badge tone="slate">{a.kind}</Badge>, <span className="text-[13px] text-ink-500">{a.requester}</span>,
            <span className="text-[13px] text-ink-500">{a.age}</span>, <Action variant="outline" size="sm" onClick={review}>Review</Action>,
        ])}/>
    </Card>;
}

export function Delivery() {
    return <Card title="Course delivery activity" subtitle="Active course offerings at each month end" actions={<Badge tone="emerald">79 live</Badge>}>
        <DeliveryColumns labels={enrolmentTrend.labels} values={enrolmentTrend.series[1].values}/>
    </Card>;
}

export function Participation() {
    return <Card title="Completion by faculty" subtitle="Share of published course material completed by enrolled students">
        <div className="space-y-4"><HorizontalBars items={completionByFaculty}/>
            <div className="rounded-xl border border-ink-100 p-3.5"><p className="text-[12px] font-semibold text-ink-700">Weakest coverage</p>
                <p className="mt-1 text-xs leading-relaxed text-ink-500">Faculty of Arts and Education trails the institution by 8 points, driven by Week 4-6 content in ENG210 and EDM505 still in draft.</p></div>
        </div>
    </Card>;
}

export function Activity() {
    return <Card title="Recent activity" subtitle="Audit-worthy events from the last 24 hours">
        <ol className="grid grid-cols-1 gap-x-8 gap-y-4 border-l border-ink-100 pl-5 lg:grid-cols-2">{activityFeed.map(a =>
            <li className="relative" key={a.who}><span className="absolute -left-[25px] top-1.5 size-2.5 rounded-full border-2 border-white bg-brand-500"/>
                <p className="text-[13px] leading-relaxed text-ink-700"><span className="font-semibold text-ink-900">{a.who}</span> {a.action}</p>
                <p className="mt-0.5 text-[11px] text-ink-400">{a.when}</p></li>)}</ol>
    </Card>;
}
