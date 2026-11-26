import { useState } from 'react';
import { Action } from '@/components/ui/controls/Action';
import { Badge } from '@/components/ui/data-display/Badge';
import { Card } from '@/components/ui/layout/Card';
import { PageHeader } from '@/components/ui/layout/PageHeader';
import { Table } from '@/components/ui/data-display/Table';
import { workspaceUrl } from '@/lib/workspaceUrl';
import type { Assignment, Receipt, StudentWork } from '@/types/assessments/assignments';
import { Details, RecordName, Status } from './RecordDetails';
import { Note } from '@/components/ui/feedback/Note';
import { SubmissionPanel } from './SubmissionPanel';
import { ReturnedScripts } from './ReturnedScripts';
import { SubmittedWorkList } from './assignments/SubmittedWorkList';

export default function StudentAssignments({
    work,
    rules,
    sizeLimit,
}: {
    work: StudentWork[];
    rules: [string, string][];
    sizeLimit: number;
}) {
    const [records, setRecords] = useState(work);
    const [selectedId, selectAssignment] = useState<string>();
    const [message, setMessage] = useState('');
    const selected = records.find((record) => record.assignment.id === selectedId);
    const outstanding = records.filter(
        ({ assignment, current }) => assignment.state === 'open' && !current,
    ).length;

    function openAssignment(assignment: Assignment) {
        selectAssignment(assignment.id);
    }

    function recordSubmission(receipt: Receipt) {
        if (!selected || selected.assignment.state !== 'open') {
            return;
        }

        setRecords((records) =>
            records.map((record) =>
                record.assignment.id === selectedId
                    ? {
                          ...record,
                          previous: record.current ? [record.current, ...record.previous] : record.previous,
                          current: { receipt },
                      }
                    : record,
            ),
        );
        setMessage(`Work recorded locally. Receipt ${receipt.number} issued for ${receipt.file}.`);
        selectAssignment(undefined);
    }

    return (
        <div className="assessment-view space-y-5">
            <PageHeader
                eyebrow="Assessment"
                title="Assignments"
                description="Choose a file while the assignment is open. This sample records file details and a receipt on this page; it does not upload the file."
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
                        <RecordName key="assignment" name={a.title} meta={a.course} />,
                        <span key="due" className="text-[13px] text-ink-600">
                            {a.due}
                        </span>,
                        <Status
                            key="status"
                            value={
                                current?.feedback
                                    ? 'Graded'
                                    : current
                                      ? 'Awaiting marking'
                                      : a.state === 'closed'
                                        ? 'Closed'
                                        : a.state === 'scheduled' ? 'Not open yet' : 'Not submitted'
                            }
                        />,
                        current?.feedback ? (
                            <span className="tnum text-[13px] font-semibold">
                                {current.feedback.score} / 100
                            </span>
                        ) : (
                            <span className="text-[12.5px] text-ink-400">-</span>
                        ),
                        <div key="actions" className="flex justify-end">
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
                <SubmittedWorkList records={records} openAssignment={openAssignment} />
                <ReturnedScripts records={records} />
            </div>
            <Note>
                A submitted file can be replaced until the closing time. Your score and any written feedback
                appear here once the lecturer has marked the work.
            </Note>
            {selected && (
                <SubmissionPanel
                    sizeLimit={sizeLimit}
                    key={selected.assignment.id}
                    row={selected.assignment}
                    revision={selected.current}
                    previous={selected.previous}
                    close={() => selectAssignment(undefined)}
                    save={recordSubmission}
                />
            )}
        </div>
    );
}
