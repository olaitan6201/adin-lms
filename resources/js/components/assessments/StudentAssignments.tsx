import { useState } from 'react';
import { Action } from '@/components/ui/controls/Action';
import { Card } from '@/components/ui/layout/Card';
import { PageHeader } from '@/components/ui/layout/PageHeader';
import { workspaceUrl } from '@/lib/workspaceUrl';
import { submissionWindow } from '@/lib/submissionWindow';
import type { Assignment, Receipt, StudentWork } from '@/types/assessments/assignments';
import { Details } from './RecordDetails';
import { Note } from '@/components/ui/feedback/Note';
import { SubmissionPanel } from './SubmissionPanel';
import { ReturnedScripts } from './ReturnedScripts';
import { SubmittedWorkList } from './assignments/SubmittedWorkList';
import { StudentAssignmentTable, type AssignmentPreview } from './assignments/StudentAssignmentTable';

export default function StudentAssignments({
    work,
    rules,
    sizeLimit,
    sampleTime,
    initialAssignmentId,
    preview,
}: {
    work: StudentWork[];
    rules: [string, string][];
    sizeLimit: number;
    sampleTime: number;
    initialAssignmentId?: string;
    preview?: {
        rows: readonly AssignmentPreview[];
        receipts: readonly string[];
        outstanding: number;
    };
}) {
    const [records, setRecords] = useState(work);
    const [selectedId, selectAssignment] = useState(() => work.find(({ assignment }) =>
        assignment.id === initialAssignmentId && submissionWindow(assignment, sampleTime) !== 'Closed',
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
            <StudentAssignmentTable
                records={records}
                sampleTime={sampleTime}
                preview={preview?.rows}
                outstanding={message ? outstanding : preview?.outstanding ?? outstanding}
                open={openAssignment}
            />
            <div className="grid gap-5 xl:grid-cols-3">
                <Card title="Submission rules" subtitle="Applied to the open assignment">
                    <Details items={rules} />
                </Card>
                <SubmittedWorkList records={records} preview={preview?.receipts} openAssignment={openAssignment} />
                <ReturnedScripts records={records} />
            </div>
            <Note>
                A submitted file can be replaced until the closing time. Your score and any written feedback appear
                here once the lecturer has marked the work.
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
