import { Badge } from '@/components/ui/data-display/Badge';
import { Table } from '@/components/ui/data-display/Table';
import { Card } from '@/components/ui/layout/Card';
import type { Learner } from '@/types/assessments/attendance';
import { RecordName } from '../RecordDetails';

function standing(percent: number) {
    if (percent < 50) {
        return <Badge tone="rose">Below threshold</Badge>;
    }

    if (percent < 75) {
        return <Badge tone="amber">Watch</Badge>;
    }

    return <Badge tone="emerald">Good</Badge>;
}

interface HistoryProps {
    learners: Learner[];
    sessionCount: number;
}

export function AttendanceHistory({ learners, sessionCount }: HistoryProps) {
    const rows = learners.map(({ name, matric, percent }) => [
        <RecordName key="student" name={name} meta={matric} />,
        `${percent}%`,
        `${Math.round((percent * sessionCount) / 100)} / ${sessionCount}`,
        standing(percent),
    ]);

    return (
        <Card title="Per-student history" subtitle="Attendance across all registered courses this semester">
            <Table
                columns={['Student', 'Percentage', 'Sessions', 'Standing']}
                rows={rows}
                rowKeys={learners.map((learner) => learner.matric)}
            />
        </Card>
    );
}
