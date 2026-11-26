import { useCourseDrafts } from '@/components/learning/useCourseDrafts';
import { allocation } from '@/data/learning/teaching';
import { workspaceUrl } from '@/lib/workspaceUrl';
import { offerings } from '@/data/learning/courseWorkspace';
import { Badge } from '@/components/ui/data-display/Badge';
import { Card } from '@/components/ui/layout/Card';
import { Action } from '@/components/ui/controls/Action';
import { Table } from '@/components/ui/data-display/Table';
import { PageHeader } from '@/components/ui/layout/PageHeader';
import { Meter, Note } from '@/components/learning/Parts';
import { TeachingAllocationDetails } from '@/components/staff/TeachingAllocationDetails';

export default function Courses() {
    const { drafts, edit } = useCourseDrafts();
    const rows = offerings.slice(0, 4).map((offering) => [
        <div key="course" className="min-w-0">
            <p className="truncate font-medium text-ink-800">{offering.title}</p>
            <p className="truncate font-mono text-[11px] text-ink-400">
                {offering.code} · {offering.term}
            </p>
        </div>,
        <span key="students" className="text-[13px] tnum">
            {offering.students}
        </span>,
        <Badge key="mode" tone="slate">
            {offering.mode}
        </Badge>,
        <Badge key="state" tone={offering.state === 'published' ? 'emerald' : 'amber'}>
            {offering.state === 'published' ? 'Published' : 'Approved'}
        </Badge>,
        <div key="progress" className="w-32">
            <Meter value={offering.completion} showValue={true} />
        </div>,
        <div key="workspace" className="flex justify-end gap-1.5">
            <Action href={workspaceUrl(`lecturer/course?course=${offering.code}`)} variant="outline" size="sm">
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
                        <a className="btn btn-outline" href="#teaching-workload">
                            Teaching workload
                        </a>
                        <Action variant="primary" onClick={() => edit('Allocation request')}>
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

                {drafts.map((draft) => (
                    <p key={draft.id}>Allocation request draft: {draft.title} · {draft.detail} (not sent)</p>
                ))}
                <div id="teaching-workload" tabIndex={-1}>
                    <TeachingAllocationDetails allocation={allocation} />
                </div>
                <Note tone="sky">
                    A lecturer can publish content, set and mark assignments, and enter scores for assigned courses only. Result publication
                    stays with an authorised officer.
                </Note>
            </div>
        </div>
    );
}
