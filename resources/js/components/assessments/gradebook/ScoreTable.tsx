import { Badge } from '@/components/ui/data-display/Badge';
import { Table } from '@/components/ui/data-display/Table';
import { RecordName, Status } from '../RecordDetails';
import { ScoreField } from './ScoreField';
import type { GradeRow, Metric } from '@/types/assessments/gradebook';

export function ScoreTable({
    visible,
    metrics,
    adjustScore,
}: {
    visible: GradeRow[];
    metrics: readonly Metric[];
    adjustScore: (matric: string, metric: Metric, value: number) => void;
}) {
    return (
        <Table
            columns={['Student', ...metrics.map(([, label]) => label), 'Total', 'Recorded grade', 'State']}
            rowKeys={visible.map((r) => r.matric)}
            rows={visible.map((r) => [
                <RecordName key="student" name={r.student} meta={r.matric} />,
                ...metrics.map((metric) => (
                    <ScoreField key={metric[0]} row={r} metric={metric} adjust={adjustScore} />
                )),
                <span key="total" className="tnum text-[13px] font-semibold text-ink-900">
                    {r.total}
                </span>,
                <Badge key="grade" tone={r.grade === 'A' ? 'emerald' : r.grade === 'F' ? 'rose' : 'slate'}>
                    {r.grade}
                </Badge>,
                r.state === 'approved' ? <Badge tone="sky">Approved</Badge> : <Status value={r.state} />,
            ])}
        />
    );
}
