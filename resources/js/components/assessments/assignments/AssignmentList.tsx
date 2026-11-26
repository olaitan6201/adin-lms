import { Action } from '@/components/ui/controls/Action';
import { Badge } from '@/components/ui/data-display/Badge';
import { Card } from '@/components/ui/layout/Card';
import { Table } from '@/components/ui/data-display/Table';
import type { Assignment } from '@/types/assessments/assignments';
import { RecordName, Status } from '../RecordDetails';

export function AssignmentList({
    rows,
    edit,
    openMarking,
}: {
    rows: Assignment[];
    edit: (row: Assignment | 'new') => void;
    openMarking: (row: Assignment) => void;
}) {
    return (
        <Card
            className="assignment-list"
            title="Assignments"
            subtitle="Instructions, attachments, opening and closing dates, late rules and group work"
            actions={
                <>
                    <Badge>{rows.length} assignments</Badge>
                    <Action size="sm" variant="primary" icon="plus" onClick={() => edit('new')}>
                        New assignment
                    </Action>
                </>
            }
        >
            <Table
                columns={['Assignment', 'State', 'Submitted', 'Late', 'Marked', '']}
                rowKeys={rows.map((row) => row.id)}
                rows={rows.map((r) => [
                    <RecordName key="assignment" name={r.title} meta={`${r.course} · due ${r.due}`} />,
                    <Status key="state" value={r.state} />,
                    <span key="submitted" className="tnum text-[13px]">
                        {r.submissions} / {r.total}
                    </span>,
                    <span
                        key="late"
                        className={`tnum text-[13px] ${r.late ? 'text-amber-700' : 'text-ink-500'}`}
                    >
                        {r.late}
                    </span>,
                    <div key="marked" className="flex w-28 items-center gap-2">
                        <div className="prog-track">
                            <div
                                className={`prog-fill ${r.marked === r.total ? 'bg-brand-500' : 'bg-amber-500'}`}
                                style={{ width: `${(100 * r.marked) / (r.total || 1)}%` }}
                            />
                        </div>
                        <span className="tnum text-[11px] font-medium text-ink-600">
                            {Math.round((100 * r.marked) / (r.total || 1))}%
                        </span>
                    </div>,
                    <div key="actions" className="flex justify-end gap-1.5">
                        <Action size="sm" onClick={() => edit(r)}>
                            Edit
                        </Action>
                        <Action size="sm" onClick={() => openMarking(r)}>
                            Mark
                        </Action>
                    </div>,
                ])}
            />
        </Card>
    );
}
