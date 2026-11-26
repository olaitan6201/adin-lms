import { useState } from 'react';
import { Action } from '@/components/ui/controls/Action';
import { Card } from '@/components/ui/layout/Card';
import { Table } from '@/components/ui/data-display/Table';
import { exportRecords, Field, Note, Register, useDesk } from '@/components/registry/Desk';
import { cap, Records, status, val } from '@/components/registry/Records';
import { courses as catalogue } from '@/components/registry/fixtures/academics';
import { programmes } from '@/components/registry/fixtures/institution';

const outcomes = ['Accounting equation','Journal entries','Trial balance','Asset recognition','Inventory valuation','Depreciation'];
const weights = [[3,2,0,1,0],[3,3,1,2,1],[2,3,2,1,0],[1,2,3,2,1],[0,1,3,2,2],[1,1,2,3,1]];
const programmeOutcomes = ['Apply accounting theory to the preparation of financial statements.','Demonstrate ethical judgement in reporting decisions.','Use quantitative methods to analyse business transactions.','Communicate findings to non-specialist audiences.','Apply information technology to accounting processes.'];
const description = 'Preparation and interpretation of financial statements for reporting entities, including the recognition, measurement and presentation of assets, liabilities and equity.';
export default function Curriculum() {
    const [tab, setTab] = useState(0);
    const [courses, setCourses] = useState(catalogue.map(c => ({...c,description:c.code==='ACC302'?description:''})));
    const [versions,setVersions] = useState(programmes.map(p => ({...p,version:'v2 approved'})));
    const desk = useDesk();
    function courseForm(c?: typeof courses[number]) {
        desk.show({title:c ? `${c.code} · ${c.title}`:'Add course', subtitle:c && `${cap(c.state)} · ${c.units} credit units · Level ${c.level}, Semester ${c.semester}`,submit:'Save',message:'Course definition saved',body:<>
            <div className="grid grid-cols-2 gap-3"><Field label="Course code" value={c?.code} readOnly={!!c} required/><Field label="Credit units" type="number" value={c?.units ?? 3} required/><Field label="Level" value={c?.level} options={['100','200','300','400','500']}/><Field label="Semester" value={`Semester ${c?.semester ?? 1}`} options={['Semester 1','Semester 2']}/></div>
            {!c && <Field label="Course title" required/>}<Field label="Description" type="textarea" value={c?.description}/><Field label="Prerequisites" value={c?.prereq} options={Array.from(new Set([c?.prereq ?? 'None','None',...courses.map(v => v.code)]))}/>
            {c?.code==='ACC302' && <Card title="Learning outcomes"><ul className="list-disc space-y-2 pl-5 text-sm"><li>Explain the accounting equation and apply it to transactions.</li><li>Record transactions in journals and transfer to ledgers.</li><li>Prepare a trial balance and identify errors of principle.</li></ul></Card>}
            <Note>Changing a published course definition creates a new curriculum version. Existing offerings and results keep the version they were created under.</Note></>,save:d => {
                const entry = {...(c ?? {code:val(d,'Course code'),title:val(d,'Course title'),state:'draft',type:'Compulsory',department:''}),units:Number(val(d,'Credit units')),level:Number(val(d,'Level')),semester:Number(val(d,'Semester').slice(-1)),description:val(d,'Description'),prereq:val(d,'Prerequisites')};
                setCourses(cs => c ? cs.map(v => v.code===c.code?entry:v) : [...cs,entry]);
            }});
    }
    function newVersion() {
        desk.show({title:'New curriculum version',body:<Field label="Programme" options={programmes.map(p => p.title)}/>,submit:'Create draft',save:d => {
            setVersions(vs => vs.map(v => v.title === val(d,'Programme') ? {...v,version:'v3 draft'} : v));
            setTab(1);
        }});
    }
    return <Register title="Curriculum catalogue" eyebrow="Curriculum and catalogue" description="Course definitions, programme versions and the outcome mapping that QA reports against." actions={<><Action icon="download" onClick={() => exportRecords('curriculum',courses)}>Export curriculum</Action><Action icon="plus" variant="primary" onClick={newVersion}>New curriculum version</Action></>} overlay={desk.overlay} active={tab} select={setTab} tabs={[[ 'Course catalogue',courses.length],['Programme versions',versions.length],['Outcome mapping']]}>
        {tab===0 && <Records title="Course catalogue" subtitle="Approved and draft course definitions with credit units, prerequisites and level placement" actions={<>{status(`${courses.length} courses`)}<Action size="sm" variant="primary" icon="plus" onClick={() => courseForm()}>Add course</Action></>} columns={['Code','Title','Units','Level','Type','Prerequisite','State','']} rows={courses.map(c => [<code>{c.code}</code>,c.title,c.units,`L${c.level} S${c.semester}`,status(c.type,c.type==='Compulsory'?'emerald':'slate'),c.prereq,status(c.state,c.state==='published'?'sky':undefined),<Action size="sm" onClick={() => courseForm(c)}>Open</Action>])}/>}
        {tab===1 && <Records title="Curriculum versions" subtitle="Approved versions are retained; changes create a new version rather than overwriting" columns={['Code','Programme','Level','Units','Version','Approved','']} rows={versions.map(p => [p.code,p.title,status(`L${p.level}`),p.units,status(p.version,p.version==='v2 approved'?'emerald':'amber'),p.code==='ACC'?'12 Oct 2026':'04 Sep 2026',<Action size="sm" onClick={() => desk.show({title:`Outcome mapping for ${p.title}`,subtitle:`Version 2 · approved ${p.code==='ACC'?'12 Oct':'04 Sep'} 2026`,submit:'Submit mapping',message:'Mapping submitted for approval',body:<><Card title="Programme outcomes"><ol className="space-y-2 text-sm">{programmeOutcomes.map((o,i) => <li key={o}><code>PO{i+1}</code>　{o}</li>)}</ol></Card><Note>Each mapping change is versioned. QA reports the approved structure for the current session.</Note></>,save:() => setVersions(vs => vs.map(v => v.id===p.id?{...v,version:'Awaiting approval'}:v))})}>Map outcomes</Action>])}/>}
        {tab===2 && <Card title="Course outcome to programme outcome mapping" subtitle="Weight: 0 none, 1 introduced, 2 reinforced, 3 mastered" actions={<>{status('NUC CCMAS format','emerald')}<Action size="sm" icon="download" onClick={() => exportRecords('outcome-matrix',outcomes.map((name,i) => ({name,weights:weights[i]})))}>Export matrix</Action></>}>
            <Table columns={['','PO1','PO2','PO3','PO4','PO5']} rows={outcomes.map((o,i) => [`CO${i+1} ${o}`,...weights[i].map(w => <span className="block rounded p-2 text-center" style={{background:['#f1f5f9','#d9f4e9','#91dec2','#34bd93'][w]}}>{w}</span>)])}/><p className="mt-4 text-xs text-slate-500">Mastered (3)　　 Reinforced (2)　　 Introduced (1)　　 Not covered (0)</p></Card>}
    </Register>;
}
