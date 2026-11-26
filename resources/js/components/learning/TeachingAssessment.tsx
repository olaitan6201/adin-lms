import type { GradeRows, TeachingAssignments } from '@/types/learning/study';

import { Badge } from '@/components/ui/data-display/Badge';
import { Card } from '@/components/ui/layout/Card';
import { Action } from '@/components/ui/controls/Action';
import { Table } from '@/components/ui/data-display/Table';

import { workspaceUrl } from '@/lib/workspaceUrl';

export function AssignmentsPanel({ assignments }: { assignments: TeachingAssignments }) {
    const visible = assignments.slice(0, 3);
    const rows = visible.map((assignment) => [
        <div key="assignment" className="min-w-0">
            <p className="truncate font-medium text-ink-800">{assignment.title}</p>
            <p className="truncate text-[11px] text-ink-400">Due {assignment.due}</p>
        </div>,
        <span key="submissions" className="text-[13px] tnum">
            {assignment.submissions} / {assignment.total}
        </span>,
        <Badge
            key="state"
            tone={assignment.state === 'open' ? 'emerald' : assignment.state === 'scheduled' ? 'sky' : 'slate'}
        >
            {assignment.state === 'open' ? 'Open' : assignment.state === 'scheduled' ? 'Scheduled' : 'Closed'}
        </Badge>,
        <div key="actions" className="flex justify-end gap-1.5">
            <Action href={workspaceUrl('lecturer/assignments')} variant="outline" size="sm">
                Open
            </Action>
        </div>,
    ]);

    return (
        <Card
            className="[&_th:last-child]:w-[90px]"
            title="Assignments in this course"
            subtitle="Instructions, rules and marking progress"
        >
            <Table
                columns={['Assignment', 'Submitted', 'State', '']}
                rows={rows}
                rowKeys={visible.map((item) => item.id)}
            />
        </Card>
    );
}

export function GradebookPanel({ gradeRows }: { gradeRows: GradeRows }) {
    const rows = gradeRows.map((row) => [
        <span key="student" className="font-medium text-ink-800">
            {row.student}
        </span>,
        <span key="ca" className="text-[13px] tnum">
            {row.ca}
        </span>,
        <span key="mid" className="text-[13px] tnum">
            {row.mid}
        </span>,
        <span key="total" className="text-[13px] font-semibold tnum">
            {row.total}
        </span>,
        <Badge key="grade" tone={row.grade === 'A' ? 'emerald' : row.grade === 'F' ? 'rose' : 'slate'}>
            {row.grade}
        </Badge>,
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
