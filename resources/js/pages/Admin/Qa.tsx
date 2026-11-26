import { useState } from 'react';
import { Action } from '@/components/ui/controls/Action';
import { Card } from '@/components/ui/layout/Card';
import { Ring } from '@/components/ui/data-display/Ring';
import { Icon } from '@/components/icons/Icon';
import { exportRecords, Field, Note, Register, useDesk } from '@/components/registry/Desk';
import { cap, Records, status, val } from '@/components/registry/Records';
import { qaChecks, qaFindings, qaReviewQueue, qaSummary } from '@/data/registry/quality';
import { workspaceUrl } from '@/lib/workspaceUrl';

export default function Qa() {
    const desk = useDesk();
    const [lastRun, setRun] = useState(qaSummary.lastRun);
    const [queue, setQueue] = useState(qaReviewQueue);
    const metrics = [
        ['Courses in scope', qaSummary.coursesInScope, 'text-ink-900'],
        ['Passed', qaSummary.passed, 'text-brand-700'],
        ['Needs attention', qaSummary.watch, 'text-amber-700'],
        ['Failed', qaSummary.failed, 'text-rose-700'],
    ] as const;

    function runChecks() {
        setRun(new Date().toLocaleString('en-GB'));
        desk.notify('Compliance checks completed');
    }

    function download() {
        exportRecords('compliance-report', [qaSummary, ...qaChecks, ...qaFindings, ...queue]);
    }

    function openReview() {
        desk.show({
            title: 'Open review',
            submit: 'Start review',
            body: <Field label="Subject" options={queue.map(item => item.subject)} />,
            save: data => setQueue(current => current.map(item =>
                item.subject === val(data, 'Subject') ? { ...item, state: 'in review' } : item)),
        });
    }

    return <Register eyebrow="Quality assurance" title="QA and compliance" overlay={desk.overlay}
        description="The checks the institution runs against its own catalogue, and the findings that still need a decision."
        actions={<>
            <Action icon="target" href={workspaceUrl('admin/course')}>Report approved structure</Action>
            <Action icon="download" variant="primary" onClick={download}>Export report</Action>
        </>}>
        <Note>A reviewer sees the approved catalogue, the running checks and the open findings. A reviewer cannot publish, grade or release a result.</Note>
        <Card title="Compliance run" subtitle={qaSummary.scope} actions={<>
            {status(`Last run ${lastRun}`)}
            <Action icon="refresh" size="sm" onClick={runChecks}>Run checks again</Action>
        </>}>
            <div className="flex flex-wrap items-center gap-6 [&_[role=img]_.text-ink-500]:text-ink-400">
                <Ring value={Math.round(qaSummary.passed / qaSummary.checksRun * 100)} label="Checks passed" sublabel={`${qaSummary.checksRun} run`} />
                <div className="grid min-w-0 flex-1 grid-cols-2 gap-4 sm:grid-cols-4">
                    {metrics.map(([label, value, tone]) => <div key={label} className="rounded-xl border border-ink-100 p-3.5">
                        <p className="text-[11px] font-medium uppercase tracking-wide text-ink-400">{label}</p>
                        <p className={`tnum mt-1 text-2xl font-semibold tracking-[-0.02em] ${tone}`}>{value}</p>
                    </div>)}
                </div>
            </div>
        </Card>
        <Records title="Checks run" subtitle="Each check names the rule and the evidence behind the result"
            actions={<Action icon="download" size="sm" onClick={download}>Export report</Action>}
            columns={['Course', 'Area', 'Rule', 'Evidence', 'Result']}
            rows={qaChecks.map(check => [
                <span className="text-[12.5px] font-medium text-ink-800">{check.course}</span>,
                <span className="text-[13px] text-ink-700">{check.area}</span>,
                <span className="text-[12.5px] leading-relaxed text-ink-500">{check.rule}</span>,
                <span className="text-[12.5px] text-ink-600">{check.note}</span>,
                status(cap(check.state)),
            ])} />
        <div className="grid gap-5 xl:grid-cols-2">
            <Records title="Findings" subtitle="A finding is closed only by the person who raised it"
                columns={['Finding', 'Course', 'Owner', 'Age', 'State']}
                rows={qaFindings.map(finding => [
                    <span className="flex items-center gap-2 text-[13px] font-medium text-ink-800">
                        <span className={`size-2 shrink-0 rounded-full ${finding.severity === 'high' ? 'bg-rose-500' : finding.severity === 'medium' ? 'bg-amber-500' : 'bg-ink-300'}`} />
                        {finding.title}
                    </span>,
                    <span className="text-[12.5px] text-ink-600">{finding.course}</span>,
                    <span className="text-[12.5px] text-ink-600">{finding.owner}</span>,
                    <span className="text-[12.5px] text-ink-500">{finding.age}</span>,
                    status(cap(finding.state), finding.state === 'resolved' ? 'emerald' : finding.state === 'acknowledged' ? 'sky' : 'amber'),
                ])} />
            <Records title="Review queue" subtitle="Structures, outcome mappings and record corrections submitted for review"
                actions={<Action variant="primary" icon="target" size="sm" disabled={!queue.length} onClick={openReview}>Open review</Action>}
                columns={['Subject', 'Submitted by', 'Submitted', 'Area', 'State']}
                rows={queue.map(item => [
                    <span className="text-[13px] font-medium text-ink-800">{item.subject}</span>,
                    <span className="text-[12.5px] text-ink-600">{item.submittedBy}</span>,
                    <span className="text-[12.5px] text-ink-500">{item.submitted}</span>,
                    <span className="text-[12.5px] text-ink-600">{item.area}</span>,
                    status(cap(item.state), item.state === 'in review' ? 'sky' : 'amber'),
                ])} />
        </div>
        <p className="flex items-center gap-2 text-[12px] text-ink-400">
            <Icon name="history" className="size-4" />
            Every check, finding and closure is written to the audit log with the reviewer as the actor.
        </p>
    </Register>;
}
