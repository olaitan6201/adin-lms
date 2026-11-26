import { useState } from 'react';
import { Action } from '@/components/ui/controls/Action';
import { Card } from '@/components/ui/layout/Card';
import { Ring } from '@/components/ui/data-display/Ring';
import { Icon } from '@/components/icons/Icon';
import { exportRecords, Field, Note, Register, useDesk } from '@/components/registry/Desk';
import { cap, Records, status, val } from '@/components/registry/Records';
import { qaChecks, qaFindings, qaReviewQueue, qaSummary as s } from '@/data/registry/quality';
import { workspaceUrl } from '@/lib/workspaceUrl';

export default function Qa() {
    const desk = useDesk();
    const [lastRun,setRun] = useState(s.lastRun);
    const [queue,setQueue] = useState(qaReviewQueue);
    const download = () => exportRecords('compliance-report',[s,...qaChecks,...qaFindings,...queue]);
    return <Register eyebrow="Quality assurance" title="QA and compliance" description="The checks the institution runs against its own catalogue, and the findings that still need a decision." actions={<><Action icon="target" href={workspaceUrl('admin/course')}>Report approved structure</Action><Action icon="download" variant="primary" onClick={download}>Export report</Action></>} overlay={desk.overlay}>
        <Note>A reviewer sees the approved catalogue, the running checks and the open findings. A reviewer cannot publish, grade or release a result.</Note>
        <Card title="Compliance run" subtitle={s.scope} actions={<>{status(`Last run ${lastRun}`)}<Action icon="refresh" size="sm" onClick={() => {setRun(new Date().toLocaleString('en-GB')); desk.notify('Compliance checks completed');}}>Run checks again</Action></>}><div className="flex flex-wrap items-center gap-6"><Ring value={Math.round(s.passed/s.checksRun*100)} label="Checks passed" sublabel={`${s.checksRun} run`}/><div className="grid min-w-0 flex-1 grid-cols-2 gap-4 sm:grid-cols-4">{[['Courses in scope',s.coursesInScope,'text-ink-900'],['Passed',s.passed,'text-brand-700'],['Needs attention',s.watch,'text-amber-700'],['Failed',s.failed,'text-rose-700']].map(([label,v,tone]) => <div key={label} className="rounded-xl border border-ink-100 p-3.5"><p className="text-[11px] font-medium uppercase tracking-wide text-ink-400">{label}</p><p className={`mt-1 text-2xl font-semibold ${tone}`}>{v}</p></div>)}</div></div></Card>
        <Records title="Checks run" subtitle="Each check names the rule and the evidence behind the result" actions={<Action icon="download" size="sm" onClick={download}>Export report</Action>} columns={['Course','Area','Rule','Evidence','Result']} rows={qaChecks.map(c => [<span className="text-[12.5px] font-medium text-ink-800">{c.course}</span>,<span className="text-[13px] text-ink-700">{c.area}</span>,<span className="text-[12.5px] leading-relaxed text-ink-500">{c.rule}</span>,<span className="text-[12.5px] text-ink-600">{c.note}</span>,status(cap(c.state))])}/>
        <div className="grid gap-5 xl:grid-cols-2"><Records title="Findings" subtitle="A finding is closed only by the person who raised it" columns={['Finding','Course','Owner','Age','State']} rows={qaFindings.map(f => [<span className="flex items-center gap-2 text-[13px] font-medium"><span className={`size-2 shrink-0 rounded-full ${f.severity==='high'?'bg-rose-500':f.severity==='medium'?'bg-amber-500':'bg-ink-300'}`}/>{f.title}</span>,<span className="text-[12.5px]">{f.course}</span>,<span className="text-[12.5px]">{f.owner}</span>,<span className="text-[12.5px] text-ink-500">{f.age}</span>,status(cap(f.state),f.state==='resolved'?'emerald':f.state==='acknowledged'?'sky':'amber')])}/>
        <Records title="Review queue" subtitle="Structures, outcome mappings and record corrections submitted for review" actions={<Action variant="primary" icon="target" size="sm" onClick={() => desk.show({title:'Open review',submit:'Start review',body:<Field label="Subject" options={queue.map(q => q.subject)}/>,save:d => setQueue(qs => qs.map(q => q.subject===val(d,'Subject')?{...q,state:'in review'}:q))})}>Open review</Action>} columns={['Subject','Submitted by','Submitted','Area','State']} rows={queue.map(q => [<span className="text-[13px] font-medium">{q.subject}</span>,...([q.submittedBy,q.submitted,q.area].map(v => <span className="text-[12.5px]">{v}</span>)),status(cap(q.state),q.state==='in review'?'sky':'amber')])}/></div>
        <p className="flex items-center gap-2 text-xs text-ink-400"><Icon name="history" className="size-4"/>Every check, finding and closure is written to the audit log with the reviewer as the actor.</p>
    </Register>;
}
