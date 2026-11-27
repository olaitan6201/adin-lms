import { useState } from 'react';
import { Action } from '@/components/ui/controls/Action';
import { Badge } from '@/components/ui/data-display/Badge';
import { Card } from '@/components/ui/layout/Card';
import { PageHeader } from '@/components/ui/layout/PageHeader';
import { Table } from '@/components/ui/data-display/Table';
import { workspaceUrl } from '@/lib/workspaceUrl';
import { formatInstitutionalTime, submissionWindow } from '@/lib/submissionWindow';
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
    sampleTime,
    initialAssignmentId,
}: {
    work: StudentWork[];
    rules: [string, string][];
    sizeLimit: number;
    sampleTime: number;
    initialAssignmentId?: string;
}) {
    const [records, setRecords] = useState(work);
    const [selectedId, selectAssignment] = useState(() => work.find(({ assignment, current }) =>
        assignment.id === initialAssignmentId && !current && submissionWindow(assignment, sampleTime) === 'Open',
    )?.assignment.id);
    const [message, setMessage] = useState('');
    const selected = records.find((record) => record.assignment.id === selectedId);
    const outstanding = records.filter(
        ({ assignment, current }) => submissionWindow(assignment, sampleTime) === 'Open' && !current,
    ).length;

    function openAssignment(assignment: Assignment) {
        selectAssignment(assignment.id);
    }

    function recordSubmission(receipt: Receipt) {
        if (!selected || submissionWindow(selected.assignment, sampleTime) !== 'Open') {
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

    function rowStatus({ assignment, current }: StudentWork) {
        const window = submissionWindow(assignment, sampleTime);
        if (current) {
            const result = current.feedback ? 'Graded' : 'Awaiting marking';
            return window === 'Open' ? result : `${result} · ${window}`;
        }

        return window === 'Open' ? 'Not submitted' : window;
    }

    return (
        <div className="assessment-view space-y-5">
            <PageHeader
                eyebrow="Assessment"
                title="Assignments"
                description="Choose a file before closing. Your receipt records the time and the file."
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
                    rows={records.map((record) => {
                        const { assignment: a, current } = record;
                        const window = submissionWindow(a, sampleTime);
                        const action = current ? 'View receipt' : window === 'Open' ? 'Submit' : 'View assignment';

                        return [
                            <RecordName key="assignment" name={a.title} meta={a.course} />,
                            <span key="due" className="text-[13px] text-ink-600">
                                {a.due}
                            </span>,
                            <Status key="status" value={rowStatus(record)} />,
                            current?.feedback ? (
                                <span className="tnum text-[13px] font-semibold">
                                    {current.feedback.score} / 100
                                </span>
                            ) : (
                                <span className="text-[12.5px] text-ink-400">-</span>
                            ),
                            <div key="actions" className="flex justify-end">
                                <Action size="sm" onClick={() => openAssignment(a)}>
                                    {action}
                                </Action>
                            </div>,
                        ];
                    })}
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
                Sample clock: {formatInstitutionalTime(sampleTime)} WAT. Files are not uploaded in this sample.
                You can replace a submission until closing. Scores and feedback appear after marking.
            </Note>
            {selected && (
                <SubmissionPanel
                    sizeLimit={sizeLimit}
                    key={selected.assignment.id}
                    row={selected.assignment}
                    sampleTime={sampleTime}
                    revision={selected.current}
                    previous={selected.previous}
                    close={() => selectAssignment(undefined)}
                    save={recordSubmission}
                />
            )}
        </div>
    );
}
