import { useState } from 'react';
import { Action } from '@/components/ui/controls/Action';
import { Badge } from '@/components/ui/data-display/Badge';
import { Card } from '@/components/ui/layout/Card';
import { Icon } from '@/components/icons/Icon';
import { PageHeader } from '@/components/ui/layout/PageHeader';
import { Table } from '@/components/ui/data-display/Table';
import { workspaceUrl } from '@/lib/workspaceUrl';
import type { Assignment, Receipt, Feedback } from '@/types/assessments/assignments';
import { Details, Drawer, Note, RecordName, Status } from './Controls';
import { SubmissionPanel } from './SubmissionPanel';

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
    assignments,
    work,
    initial,
    courseReceipts,
    feedback,
    rules,
    sizeLimit,
}: {
    assignments: Assignment[];
    work: Assignment[];
    initial: Record<string, Receipt>;
    courseReceipts: Record<string, Receipt>;
    feedback: Feedback[];
    rules: [string, string][];
    sizeLimit: number;
}) {
    const [receipts, setReceipts] = useState(initial);
    const [row, setRow] = useState<Assignment>();
    const [script, setScript] = useState<Feedback>();
    const [message, setMessage] = useState('');
    const receiptById = { ...courseReceipts, ...receipts };
    const feedbackById = new Map(feedback.map((entry) => [entry.id, entry]));
    const assignmentById = new Map(assignments.map((entry) => [entry.id, entry]));

    function recordSubmission(receipt: Receipt) {
        if (!row || row.state === 'closed') return;
        setReceipts((current) => ({ ...current, [row.id]: receipt }));
        setMessage(`Work recorded locally. Receipt ${receipt.number} issued for ${receipt.file}.`);
        setRow(undefined);
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
                actions={<Badge tone="amber">{work.filter((a) => a.state !== 'closed').length} outstanding</Badge>}
            >
                <Table
                    columns={['Assignment', 'Due', 'Status', 'Score', '']}
                    rowKeys={work.map(assignment => assignment.id)}
                    rows={work.map((a) => [
                        <RecordName name={a.title} meta={a.course} />,
                        <span className="text-[13px] text-ink-600">{a.due}</span>,
                        <Status value={a.state === 'closed' ? 'Graded' : receiptById[a.id] ? 'Submitted' : 'Not submitted'} />,
                        a.publishedScore != null ? (
                            <span className="tnum text-[13px] font-semibold">{a.publishedScore} / 100</span>
                        ) : (
                            <span className="text-[12.5px] text-ink-400">-</span>
                        ),
                        <div className="flex justify-end">
                            <Action size="sm" onClick={() => setRow(a)}>
                                {receiptById[a.id] ? 'View receipt' : 'View assignment'}
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
                        {assignments.map(assignment => {
                            const receipt = receipts[assignment.id];
                            if (!receipt) return null;
                            return <SubmittedWork key={assignment.id} assignment={assignment} receipt={receipt}
                                grade={feedbackById.get(assignment.id)?.score} open={setRow} />;
                        })}
                    </ul>
                </Card>
                <Card title="Feedback waiting" subtitle="Marked work returned to you">
                    <div className="space-y-3">
                        {feedback.map((f) => (
                            <article key={f.id} className="rounded-xl border border-ink-100 p-3.5">
                                <p className="text-[13px] font-medium text-ink-800">{displayTitle(assignmentById.get(f.id))}</p>
                                <p className="mt-1 text-[13px] leading-relaxed text-ink-600">{f.text}</p>
                                <div className="mt-2 flex items-center gap-2">
                                    <Badge tone="emerald">{f.score} / 100</Badge>
                                    <Action size="sm" onClick={() => setScript(f)}>
                                        Script
                                    </Action>
                                </div>
                            </article>
                        ))}
                    </div>
                </Card>
            </div>
            <Note>
                A submitted file can be replaced until the closing time. Your score and any written feedback appear here once the
                lecturer has marked the work.
            </Note>
            {row && (
                <SubmissionPanel
                    sizeLimit={sizeLimit}
                    key={row.id}
                    row={row}
                    receipt={receiptById[row.id]}
                    close={() => setRow(undefined)}
                    save={recordSubmission}
                />
            )}
            {script && (
                <Drawer title="Marked script" subtitle={assignmentById.get(script.id)?.title} close={() => setScript(undefined)}>
                    <Badge tone="emerald">{script.score} / 100</Badge>
                    <Card title="Marker feedback">{script.text}</Card>
                </Drawer>
            )}
        </div>
    );
}
