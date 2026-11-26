import { Action } from '@/components/ui/controls/Action';
import { Badge } from '@/components/ui/data-display/Badge';
import { Card } from '@/components/ui/layout/Card';
import { Table } from '@/components/ui/data-display/Table';
import type { Submission } from '@/types/assessments/assignments';
import { RecordName, Status } from '../RecordDetails';
import { exportSheet } from '@/lib/csv';

export function MarkingQueue({
    rows,
    awaiting,
    filterTitle,
    open,
}: {
    rows: Submission[];
    awaiting: number;
    filterTitle?: string;
    open: (row: Submission) => void;
}) {
    function downloadQueue() {
        exportSheet(
            'submission-queue',
            ['Student', 'Matric', 'Score'],
            rows.map((row) => [row.student, row.matric, row.score]),
        );
    }

    return (
        <Card
            title="Marking queue"
            subtitle={filterTitle || 'Submissions awaiting a score, written feedback and a returned script'}
            actions={
                <>
                    <Badge>{filterTitle ? `${rows.length} submissions shown` : `${awaiting} awaiting`}</Badge>
                    <Action size="sm" onClick={downloadQueue}>
                        Export sheet
                    </Action>
                </>
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
