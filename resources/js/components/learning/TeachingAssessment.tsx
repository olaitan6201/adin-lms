import { assignments, gradeRows } from '@/data/learning/courseWorkspace';

import { Badge } from '@/components/ui/data-display/Badge';
import { Card } from '@/components/ui/layout/Card';
import { Action } from '@/components/ui/controls/Action';
import { Table } from '@/components/ui/data-display/Table';

import { workspaceUrl } from '@/lib/workspaceUrl';

export function AssignmentsPanel() {
    const rows = assignments.slice(0, 3).map((assignment) => [
        <div className="min-w-0">
            <p className="truncate font-medium text-ink-800">{assignment.title}</p>
            <p className="truncate text-[11px] text-ink-400">Due {assignment.due}</p>
        </div>,
        <span className="text-[13px] tnum">
            {assignment.submissions} / {assignment.total}
        </span>,
        <Badge tone={assignment.state === 'open' ? 'emerald' : assignment.state === 'scheduled' ? 'sky' : 'slate'}>
            {assignment.state === 'open' ? 'Open' : assignment.state === 'scheduled' ? 'Scheduled' : 'Closed'}
        </Badge>,
        <div className="flex justify-end gap-1.5">
            <Action href={workspaceUrl('lecturer/assignments')} variant="outline" size="sm">
                Open
            </Action>
        </div>,
    ]);

    return (
        <Card className="[&_th:last-child]:w-[90px]" title="Assignments in this course" subtitle="Instructions, rules and marking progress">
            <Table columns={['Assignment', 'Submitted', 'State', '']} rows={rows} />
        </Card>
    );
}
export function GradebookPanel() {
    const rows = gradeRows
        .slice(0, 5)
        .map((row) => [
            <span className="font-medium text-ink-800">{row.student}</span>,
            <span className="text-[13px] tnum">{row.ca}</span>,
            <span className="text-[13px] tnum">{row.mid}</span>,
            <span className="text-[13px] font-semibold tnum">{row.total}</span>,
            <Badge tone={row.grade === 'A' ? 'emerald' : row.grade === 'F' ? 'rose' : 'slate'}>{row.grade}</Badge>,
        ]);

    return (
        <Card
            title="Scores"
            subtitle="Current sheet for this course"
            actions={
                <Action icon="external" variant="ghost" size="sm" href={workspaceUrl('lecturer/gradebook')}>
                    Open gradebook
                </Action>
            }
        >
            <Table columns={['Student', 'CA', 'Mid', 'Total', 'Grade']} rows={rows} />
        </Card>
    );
}
