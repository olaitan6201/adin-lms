import { Action } from '@/components/ui/controls/Action';
import { Badge } from '@/components/ui/data-display/Badge';
import { Table } from '@/components/ui/data-display/Table';
import { Card } from '@/components/ui/layout/Card';
import { submissionWindow } from '@/lib/submissionWindow';
import type { Assignment, StudentWork } from '@/types/assessments/assignments';
import { RecordName, Status } from '../RecordDetails';

export type AssignmentPreview = {
    id: string;
    status: string;
    tone: string;
    score?: number;
    action: string;
};

function rowStatus({ assignment, current }: StudentWork, sampleTime: number) {
    const window = submissionWindow(assignment, sampleTime);
    if (current) {
        const result = current.feedback ? 'Graded' : 'Awaiting marking';
        return window === 'Open' ? result : `${result} · ${window}`;
    }

    return window === 'Open' ? 'Not submitted' : window;
}

export function StudentAssignmentTable({ records, sampleTime, preview, outstanding, open }: {
    records: StudentWork[];
    sampleTime: number;
    preview?: readonly AssignmentPreview[];
    outstanding: number;
    open: (assignment: Assignment) => void;
}) {
    const rows = preview
        ? records.filter(({ assignment }) => preview.some(({ id }) => id === assignment.id))
        : records;

    return (
        <Card
            className="student-assignments"
            title="Your assignments"
            subtitle="Across all registered courses"
            actions={<Badge tone="amber">{outstanding} outstanding</Badge>}
        >
            <Table
                columns={['Assignment', 'Due', 'Status', 'Score', '']}
                rowKeys={rows.map(({ assignment }) => assignment.id)}
                rows={rows.map((record) => {
                    const { assignment, current, previous } = record;
                    const sample = previous.length ? undefined : preview?.find(({ id }) => id === assignment.id);
                    const window = submissionWindow(assignment, sampleTime);
                    const action = current ? 'View receipt' : window === 'Open' ? 'Submit' : 'View assignment';
                    const score = sample ? sample.score : current?.feedback?.score;

                    return [
                        <RecordName key="assignment" name={assignment.title} meta={assignment.course} />,
                        <span key="due" className="text-[13px] text-ink-600">{assignment.due}</span>,
                        sample
                            ? <Badge key="status" tone={sample.tone}>{sample.status}</Badge>
                            : <Status key="status" value={rowStatus(record, sampleTime)} />,
                        score === undefined
                            ? <span key="score" className="text-[12.5px] text-ink-400">-</span>
                            : <span key="score" className="text-[13px] font-semibold tnum">{score} / 100</span>,
                        <div key="actions" className="flex justify-end">
                            <Action size="sm" onClick={() => open(assignment)}>
                                {sample?.action ?? action}
                            </Action>
                        </div>,
                    ];
                })}
            />
        </Card>
    );
}
