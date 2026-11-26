import { Action } from '@/components/ui/controls/Action';
import { Card } from '@/components/ui/layout/Card';
import { Table } from '@/components/ui/data-display/Table';
import type { Submission } from '@/types/assessments/assignments';
import { RecordName, Status } from '../RecordDetails';
import { exportSheet } from '@/lib/csv';

export function MarkingQueue({
    rows,
    filterTitle,
    open,
}: {
    rows: Submission[];
    filterTitle?: string;
    open: (row: Submission) => void;
}) {
    return (
        <Card
            title="Marking queue"
            subtitle={filterTitle || 'Submissions awaiting a score, written feedback and a returned script'}
            actions={
                <Action
                    size="sm"
                    onClick={() =>
                        exportSheet(
                            'submission-queue',
                            ['Student', 'Matric', 'Score'],
                            rows.map((r) => [r.student, r.matric, r.score]),
                        )
                    }
                >
                    Export sheet
                </Action>
            }
        >
            <Table
                columns={['Student', 'Submitted', 'Timing', 'Status', 'Score', '']}
                empty="No submissions for this assignment."
                rowKeys={rows.map((script) => script.id)}
                rows={rows.map((r) => [
                    <RecordName key="student" name={r.student} meta={r.matric} />,
                    r.submitted,
                    r.late ? 'Late' : 'On time',
                    <Status key="status" value={r.status} />,
                    r.score ?? '—',
                    <Action key="actions" size="sm" onClick={() => open(r)}>
                        Open
                    </Action>,
                ])}
            />
        </Card>
    );
}
