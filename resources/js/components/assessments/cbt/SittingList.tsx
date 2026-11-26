import { Action } from '@/components/ui/controls/Action';
import { Badge } from '@/components/ui/data-display/Badge';
import { Card } from '@/components/ui/layout/Card';
import { Table } from '@/components/ui/data-display/Table';
import type { Exam } from '@/types/assessments/cbt';
import { RecordName, Status } from '../RecordDetails';

export function SittingList({
    sittings,
    schedule,
    open,
}: {
    sittings: Exam[];
    schedule: React.ReactNode;
    open: (exam: Exam) => void;
}) {
    return (
        <Card
            title="Examinations"
            subtitle="Access window, attempt limit, accommodations and result release control"
            actions={
                <>
                    <Badge tone="sky">
                        {sittings.filter((e) => e.state === 'scheduled').length} scheduled
                    </Badge>
                    {schedule}
                </>
            }
        >
            <Table
                columns={['Examination', 'Date', 'Duration', 'Attempts', 'State', 'Result release', '']}
                rowKeys={sittings.map((sitting) => sitting.id)}
                rows={sittings.map((e) => [
                    <RecordName key="exam" name={e.title} meta={e.course} />,
                    e.date,
                    e.duration,
                    `${e.attempts} / ${e.candidates}`,
                    <Status key="state" value={e.state} />,
                    e.release,
                    <Action key="blueprint" size="sm" onClick={() => open(e)}>
                        Blueprint
                    </Action>,
                ])}
            />
        </Card>
    );
}
