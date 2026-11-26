import { allocation } from '@/data/learning/teaching';
import { workspaceUrl } from '@/lib/workspaceUrl';
import { offerings } from '@/data/learning/courseWorkspace';
import { Badge } from '@/components/ui/data-display/Badge';
import { Card } from '@/components/ui/layout/Card';
import { Action } from '@/components/ui/controls/Action';
import { Table } from '@/components/ui/data-display/Table';
import { PageHeader } from '@/components/ui/layout/PageHeader';
import { Meter, Note } from '@/components/learning/Parts';

export default function Courses() {
    const rows = offerings.slice(0, 4).map((offering) => [
        <div className="min-w-0">
            <p className="truncate font-medium text-ink-800">{offering.title}</p>
            <p className="truncate font-mono text-[11px] text-ink-400">
                {offering.code} · {offering.term}
            </p>
        </div>,
        <span className="text-[13px] tnum">{offering.students}</span>,
        <Badge tone="slate">{offering.mode}</Badge>,
        <Badge tone={offering.state === 'published' ? 'emerald' : 'amber'}>{offering.state === 'published' ? 'Published' : 'Approved'}</Badge>,
        <div className="w-32">
            <Meter value={offering.completion} showValue={true} />
        </div>,
        <div className="flex justify-end gap-1.5">
            <Action href={workspaceUrl('lecturer/course')} variant="outline" size="sm">
                Workspace
            </Action>
        </div>,
    ]);

    return (
        <div className="learning-surface">
            <PageHeader
                eyebrow="Teaching"
                title="My courses"
                description="Course allocations are scoped by the institution. You can only see and act on the courses assigned to you."
                actions={
                    <>
                        <Action icon="chart" variant="outline">
                            Teaching workload
                        </Action>
                        <Action icon="plus" variant="primary">
                            Request allocation
                        </Action>
                    </>
                }
            />

            <div className="space-y-5">
                <Card
                    className="[&_th:last-child]:w-[120px]"
                    title="Allocated courses"
                    subtitle={allocation.term}
                    actions={
                        <>
                            <Badge tone="emerald">{allocation.courseCount}</Badge>
                            <Badge tone="slate">{allocation.studentCount}</Badge>
                        </>
                    }
                >
                    <Table columns={['Course', 'Students', 'Mode', 'State', 'Learner progress', '']} rows={rows} />
                </Card>

                <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
                    <Card title="Teaching workload" subtitle="Contact hours and assessment load this semester">
                        <ul className="divide-y divide-ink-100">
                            {allocation.workload.map((item) => (
                                <li key={item.label} className="flex items-center justify-between gap-3 py-2.5">
                                    <span className="text-[13px] text-ink-600">{item.label}</span>
                                    <span className="text-[13px] font-semibold text-ink-800 tnum">{item.value}</span>
                                </li>
                            ))}
                        </ul>
                    </Card>
                    <Card title="Course preparation" subtitle="What must be ready before the next class">
                        <ul className="divide-y divide-ink-100">
                            {allocation.preparation.map((item) => (
                                <li key={item.title} className="flex items-center justify-between gap-3 py-2.5">
                                    <span className="text-[13px] text-ink-700">{item.title}</span>
                                    <Badge tone={item.tone}>{item.state}</Badge>
                                </li>
                            ))}
                        </ul>
                    </Card>
                    <Card title="Your students" subtitle="Distribution of attention across cohorts">
                        <div className="space-y-4">
                            {allocation.bands.map((band) => (
                                <div key={band.label}>
                                    <div className="mb-1 flex items-center justify-between gap-3">
                                        <span className="text-[13px] text-ink-600">{band.label}</span>
                                        <span className="text-[13px] font-semibold text-ink-800 tnum">{band.value}</span>
                                    </div>
                                    <div className="h-2 w-full overflow-hidden rounded-full bg-ink-100">
                                        <div
                                            className="h-full rounded-full"
                                            style={{ width: `${(band.value / allocation.cohortSize) * 100}%`, background: `${band.color}` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>
                <Note tone="sky">
                    A lecturer can publish content, set and mark assignments, and enter scores for assigned courses only. Result publication
                    stays with an authorised officer.
                </Note>
            </div>
        </div>
    );
}
