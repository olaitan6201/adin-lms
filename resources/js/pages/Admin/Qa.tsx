import { useState } from 'react';
import { Action } from '@/components/ui/controls/Action';
import { Icon } from '@/components/icons/Icon';
import { exportRecords, Field, Register, useDesk } from '@/components/registry/Desk';
import { Note } from '@/components/ui/feedback/Note';
import { cap, Records, status, val } from '@/components/registry/Records';
import { qaChecks, qaFindings, qaReviewQueue, qaSummary } from '@/data/registry/quality';
import { workspaceUrl } from '@/lib/workspaceUrl';
import { ComplianceRun } from '@/components/quality/ComplianceRun';
import { ReviewFindings } from '@/components/quality/ReviewFindings';

export default function Qa() {
    const desk = useDesk();
    const [lastRun, setRun] = useState(qaSummary.lastRun);
    const [queue, setQueue] = useState(qaReviewQueue);

    function runChecks() {
        setRun(new Date().toLocaleString('en-GB'));
        desk.notify('Compliance checks completed');
    }

    function download() {
        exportRecords('compliance-report', [{ ...qaSummary, lastRun }, ...qaChecks, ...qaFindings, ...queue]);
    }

    function openReview() {
        desk.show({
            title: 'Open review',
            submit: 'Start review',
            body: <Field label="Subject" options={queue.map((item) => item.subject)} />,
            save: (data) =>
                setQueue((current) =>
                    current.map((item) => (item.subject === val(data, 'Subject') ? { ...item, state: 'in review' } : item)),
                ),
        });
    }

    return (
        <Register
            eyebrow="Quality assurance"
            title="QA and compliance"
            overlay={desk.overlay}
            description="The checks the institution runs against its own catalogue, and the findings that still need a decision."
            actions={
                <>
                    <Action icon="target" href={workspaceUrl('admin/course')}>
                        Report approved structure
                    </Action>
                    <Action icon="download" variant="primary" onClick={download}>
                        Export report
                    </Action>
                </>
            }
        >
            <Note>
                A reviewer sees the approved catalogue, the running checks and the open findings. A reviewer cannot publish, grade or
                release a result.
            </Note>
            <ComplianceRun summary={qaSummary} lastRun={lastRun} runChecks={runChecks} />
            <Records
                title="Checks run"
                subtitle="Each check names the rule and the evidence behind the result"
                actions={
                    <Action icon="download" size="sm" onClick={download}>
                        Export report
                    </Action>
                }
                columns={['Course', 'Area', 'Rule', 'Evidence', 'Result']}
                rows={qaChecks.map((check) => [
                    <span key="course" className="text-[12.5px] font-medium text-ink-800">
                        {check.course}
                    </span>,
                    <span key="area" className="text-[13px] text-ink-700">
                        {check.area}
                    </span>,
                    <span key="rule" className="text-[12.5px] leading-relaxed text-ink-500">
                        {check.rule}
                    </span>,
                    <span key="evidence" className="text-[12.5px] text-ink-600">
                        {check.note}
                    </span>,
                    status(cap(check.state)),
                ])}
            />
            <div className="grid gap-5 xl:grid-cols-2">
                <ReviewFindings findings={qaFindings} />
                <Records
                    title="Review queue"
                    subtitle="Structures, outcome mappings and record corrections submitted for review"
                    actions={
                        <Action
                            variant="primary"
                            icon="target"
                            size="sm"
                            disabled={!queue.length}
                            onClick={openReview}
                        >
                            Open review
                        </Action>
                    }
                    columns={['Subject', 'Submitted by', 'Submitted', 'Area', 'State']}
                    rows={queue.map((item) => [
                        <span key="subject" className="text-[13px] font-medium text-ink-800">
                            {item.subject}
                        </span>,
                        <span key="submitter" className="text-[12.5px] text-ink-600">
                            {item.submittedBy}
                        </span>,
                        <span key="submitted" className="text-[12.5px] text-ink-500">
                            {item.submitted}
                        </span>,
                        <span key="area" className="text-[12.5px] text-ink-600">
                            {item.area}
                        </span>,
                        status(cap(item.state), item.state === 'in review' ? 'sky' : 'amber'),
                    ])}
                />
            </div>
            <p className="flex items-center gap-2 text-[12px] text-ink-400">
                <Icon name="history" className="size-4" />
                Every check, finding and closure is written to the audit log with the reviewer as the actor.
            </p>
        </Register>
    );
}
