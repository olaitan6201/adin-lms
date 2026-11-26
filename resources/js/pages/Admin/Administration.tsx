import { useState } from 'react';
import { Action } from '@/components/ui/controls/Action';
import { Card } from '@/components/ui/layout/Card';
import { exportRecords, Field, Register, useDesk } from '@/components/registry/Desk';
import { cap, Details, Metrics, Records, status, val } from '@/components/registry/Records';
import { InstitutionSettings, Privacy } from '@/components/registry/InstitutionSettings';
import { AccessibilityPanel } from '@/components/registry/AccessibilityPanel';
import { auditLog, integrations, performanceMetrics, portability, securityEvents } from '@/data/registry/governance';

const initialBackups = [
    ['Nightly full','26 Nov 2026, 02:00','41.2 GB','Passed','24 hours'],
    ['Nightly full','25 Nov 2026, 02:00','40.9 GB','Passed','24 hours'],
    ['Pre-examination snapshot','23 Nov 2026, 18:00','40.4 GB','Passed','Point in time'],
    ['Nightly full','24 Nov 2026, 02:00','40.8 GB','Failed, retried','24 hours'],
];
export default function Administration() {
    const [tab,setTab] = useState(0);
    const [connections,setConnections] = useState(integrations);
    const [backups,setBackups] = useState(initialBackups);
    const desk = useDesk();
    const performance = <Records title="Service performance" subtitle="Measured against the agreed targets" columns={['Metric','Observed','Target','Status']} rows={performanceMetrics.map(m => [m.metric,m.value,m.target,status(m.state==='good'?'On target':'Watch',m.state==='good'?'emerald':'amber')])}/>;
    return <Register eyebrow="System" title="Administration" description="Settings, integrations, security, recovery, data protection and the portability paths the institution has agreed." overlay={desk.overlay} actions={<><Action icon="download" onClick={() => exportRecords('audit-export',auditLog)}>Audit export</Action><Action icon="activity" variant="primary" onClick={() => desk.show({title:'System health',body:performance})}>System health</Action></>} tabs={[[ 'Settings'],['Integrations',connections.length],['Security and audit'],['Backup and recovery'],['Data protection'],['Accessibility']]} active={tab} select={setTab}>
        <div className={tab===0?'space-y-5':'hidden'}><InstitutionSettings/></div>
        {tab===1 && <><Card title="Connection points" subtitle="Institutional email and live classroom delivery are baseline; the rest are agreed with the institution"><div className="grid gap-3 lg:grid-cols-2">{connections.map(c => <div key={c.id} className="rounded-xl border border-ink-100 p-4"><div className="flex items-start justify-between gap-3"><div><h3 className="text-[13.5px] font-semibold">{c.name}</h3><p className="mt-0.5 text-xs text-ink-500">{c.type}</p></div>{status(cap(c.state),c.state==='planned'?'slate':c.state==='unavailable'?'rose':undefined)}</div><p className="mt-3 text-xs text-ink-600">{c.detail}</p><div className="mt-3 flex items-center justify-between"><code className="text-[11px] text-ink-400">{c.version}</code><Action size="sm" onClick={() => desk.show({title:`Configure ${c.name}`,submit:'Save configuration',body:<><Field label="Connection detail" value={c.detail} required/><Field label="Version" value={c.version}/><Field label="State" value={c.state} options={['connected','configured','planned','unavailable']}/></>,save:d => setConnections(cs => cs.map(v => v.id!==c.id?v:{...v,detail:val(d,'Connection detail'),version:val(d,'Version'),state:val(d,'State')}))})}>Configure</Action></div></div>)}</div></Card>
            <Records title="Content portability" subtitle="Formats verified by round trip before migration scope is committed" columns={['Format','Support','Verification']} rows={portability.map(p => [p.format,status(p.state,p.state==='planned'?'slate':undefined),p.detail])}/></>}
        {tab===2 && <><Records title="Security events" subtitle="Failed logins, revoked sessions, rejected uploads and enrolment events" actions={status('4 in 24 hours','amber')} columns={['Event','Severity','When','']} rows={securityEvents.map(e => [<div>{e.title}<p className="text-xs text-ink-500">{e.detail}</p></div>,status(cap(e.level),e.level==='high'?'rose':e.level==='medium'?'amber':'slate'),e.time,<Action size="sm" onClick={() => desk.show({title:e.title,subtitle:e.detail,body:<Details entries={[['Severity',cap(e.level)],['When',e.time]]}/>})}>Investigate</Action>])}/>
            <Records title="Audit log" subtitle="Who changed what, when and from where" actions={<Action size="sm" icon="download" onClick={() => exportRecords('audit-log',auditLog)}>Export log</Action>} columns={['When','Who','Action','Detail','Source']} rows={auditLog.map(e => [e.when,e.who,status(e.action),e.detail,e.ip])}/></>}
        {tab===3 && <><Records title="Backup and recovery" subtitle="Scheduled backups, verification status and the agreed recovery objectives" actions={<><Action icon="save" size="sm" onClick={() => setBackups(bs => [['Manual snapshot',new Date().toLocaleString('en-GB'),'—','Queued','Point in time'],...bs])}>Run backup now</Action><Action icon="refresh" size="sm" variant="primary" onClick={() => desk.show({title:'Restore',submit:'Schedule restore',message:'Restore scheduled',body:<Field label="Backup" options={backups.map(b => `${b[0]} · ${b[1]}`)}/>})}>Restore</Action></>} columns={['Job','When','Size','Verification','Recovery point','']} rows={backups.map(([name,when,size,verify,point]) => [name,when,size,status(verify,verify==='Passed'?'emerald':'amber'),point,<Action size="sm" onClick={() => desk.notify('Restore drill scheduled for 12 Dec')}>Restore drill</Action>])}><Metrics rows={[['Recovery time objective','4 hours'],['Recovery point objective','24 hours'],['Last verified restore','12 Nov 2026'],['Storage used','68%']]}/></Records>{performance}</>}
        <div className={tab===4?'space-y-5':'hidden'}><Privacy/></div>
        {tab===5 && <AccessibilityPanel/>}
    </Register>;
}
