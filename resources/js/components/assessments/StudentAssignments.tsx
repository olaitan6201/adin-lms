import { useState } from 'react';
import { Action } from '@/components/ui/controls/Action';
import { Badge } from '@/components/ui/data-display/Badge';
import { Card } from '@/components/ui/layout/Card';
import { Icon } from '@/components/icons/Icon';
import { PageHeader } from '@/components/ui/layout/PageHeader';
import { Table } from '@/components/ui/data-display/Table';
import { workspaceUrl } from '@/lib/workspaceUrl';
import type { Assignment, Receipt, StudentWork } from '@/types/assessments/assignments';
import { Details, RecordName, Status } from './Controls';
import { Note } from '@/components/ui/feedback/Note';
import { SubmissionPanel } from './SubmissionPanel';
import { ReturnedScripts } from './ReturnedScripts';

const displayTitle = (a?: Assignment) => a?.shortTitle ?? a?.title;

function SubmittedWork({ assignment, receipt, grade, open }: {
    assignment: Assignment;
    receipt: Receipt;
    grade?: number;
    open: (assignment: Assignment) => void;
}) {
    return (
        <li className="flex items-start gap-3 py-3">
            <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-ink-50 text-ink-500">
                <Icon name="document" className="size-4" />
            </span>
            <button className="min-w-0 flex-1 text-left" onClick={() => open(assignment)}>
                <span className="block truncate text-[13px] font-medium text-ink-800">{displayTitle(assignment)}</span>
                <small className="mt-0.5 block text-[11.5px] text-ink-400">{receipt.time} · {receipt.size}</small>
            </button>
            <Status value={grade === undefined ? 'Awaiting marking' : `Graded ${grade}`} />
        </li>
    );
}

export default function StudentAssignments({
    work, rules, sizeLimit,
}: {
    work: StudentWork[];
    rules: [string, string][];
    sizeLimit: number;
}) {
    const [records, setRecords] = useState(work);
    const [selectedId, selectAssignment] = useState<string>();
    const [message, setMessage] = useState('');
    const selected = records.find(record => record.assignment.id === selectedId);
    const outstanding = records.filter(({ assignment, current }) => assignment.state !== 'closed' && !current).length;

    function openAssignment(assignment: Assignment) {
        selectAssignment(assignment.id);
    }

    function recordSubmission(receipt: Receipt) {
        if (!selected || selected.assignment.state === 'closed') return;
        setRecords(records => records.map(record => record.assignment.id === selectedId ? {
            ...record,
            previous: record.current ? [record.current, ...record.previous] : record.previous,
            current: { receipt },
        } : record));
        setMessage(`Work recorded locally. Receipt ${receipt.number} issued for ${receipt.file}.`);
        selectAssignment(undefined);
    }

    return (
        <div className="assessment-view space-y-5">
            <PageHeader
                eyebrow="Assessment"
                title="Assignments"
                description="Upload your work before the closing time. Every upload issues a receipt that records the time and the file."
                actions={
                    <Action icon="calendar" href={workspaceUrl('student/calendar')}>
                        Academic calendar
                    </Action>
                }
            />
            {message && (
                <p role="status" className="rounded-lg bg-brand-50 p-3">
                    {message}
                </p>
            )}
            <Card
                className="student-assignments"
                title="Your assignments"
                subtitle="Across all registered courses"
                actions={<Badge tone="amber">{outstanding} outstanding</Badge>}
            >
                <Table
                    columns={['Assignment', 'Due', 'Status', 'Score', '']}
                    rowKeys={records.map(({ assignment }) => assignment.id)}
                    rows={records.map(({ assignment: a, current }) => [
                        <RecordName name={a.title} meta={a.course} />,
                        <span className="text-[13px] text-ink-600">{a.due}</span>,
                        <Status value={current?.feedback ? 'Graded' : current ? 'Awaiting marking' : a.state === 'closed' ? 'Closed' : 'Not submitted'} />,
                        current?.feedback ? (
                            <span className="tnum text-[13px] font-semibold">{current.feedback.score} / 100</span>
                        ) : (
                            <span className="text-[12.5px] text-ink-400">-</span>
                        ),
                        <div className="flex justify-end">
                            <Action size="sm" onClick={() => openAssignment(a)}>
                                {current ? 'View receipt' : 'View assignment'}
                            </Action>
                        </div>,
                    ])}
                />
            </Card>
            <div className="grid gap-5 xl:grid-cols-3">
                <Card title="Submission rules" subtitle="Applied to the open assignment">
                    <Details items={rules} />
                </Card>
                <Card title="Submitted work" subtitle="Your uploads and their receipts">
                    <ul className="divide-y divide-ink-100">
                        {records.map(({ assignment, current }) => {
                            if (!current) return null;
                            return <SubmittedWork key={assignment.id} assignment={assignment} receipt={current.receipt}
                                grade={current.feedback?.score} open={openAssignment} />;
                        })}
                    </ul>
                </Card>
                <ReturnedScripts records={records} />
            </div>
            <Note>
                A submitted file can be replaced until the closing time. Your score and any written feedback appear here once the
                lecturer has marked the work.
            </Note>
            {selected && (
                <SubmissionPanel
                    sizeLimit={sizeLimit}
                    key={selected.assignment.id}
                    row={selected.assignment}
                    revision={selected.current}
                    close={() => selectAssignment(undefined)}
                    save={recordSubmission}
                />
            )}
        </div>
    );
}
