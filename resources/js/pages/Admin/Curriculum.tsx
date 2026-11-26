import { programmeOutcomes, matrix, columns, catalogueEntries, programmeVersions, prerequisite, selectedCourse, accountingOutcomes } from '@/data/registry/catalogue';
import { useState } from 'react';
import { Action } from '@/components/ui/controls/Action';
import { Card } from '@/components/ui/layout/Card';
import { exportRecords, Field, Note, Register, useDesk } from '@/components/registry/Desk';
import { cap, Records, status, val } from '@/components/registry/Records';
import { programmes } from '@/data/registry/institution';

import { OutcomeMatrix } from '@/components/registry/OutcomeMatrix';

export default function Curriculum() {
    const [tab, setTab] = useState(0);
    const [courses, setCourses] = useState(catalogueEntries);
    const [versions,setVersions] = useState(programmeVersions);
    const desk = useDesk();
    function courseForm(c?: typeof courses[number]) {
        desk.show({title:c ? `${c.code} · ${c.title}`:'Add course', subtitle:c && `${cap(c.state)} · ${c.units} credit units · Level ${c.level}, Semester ${c.semester}`,submit:'Save',message:'Course definition saved',body:<>
            <div className="grid grid-cols-2 gap-3"><Field label="Course code" value={c?.code} readOnly={!!c} required/><Field label="Credit units" type="number" value={c?.units ?? 3} required/><Field label="Level" value={c?.level} options={c ? Array.from(new Set([String(c.level),'200'])) : ['100','200','300','400','500']}/><Field label="Semester" value={`Semester ${c?.semester ?? 1}`} options={['Semester 1','Semester 2']}/></div>
            {!c && <Field label="Course title" required/>}<Field label="Description" type="textarea" value={c?.description}/><Field label="Prerequisites" value={c?.prereq===prerequisite.code?prerequisite.title:c?.prereq} options={c ? [c.prereq===prerequisite.code?prerequisite.title:c.prereq,'None'] : ['None',...courses.map(v => v.code)]}/>
            {c?.code===selectedCourse.definition.code && <section className="rounded-xl border border-ink-100 p-4"><p className="mb-2 text-[13px] font-semibold">Learning outcomes</p><ul className="list-disc space-y-2 pl-5 text-sm">{accountingOutcomes.map(text => <li key={text}>{text}</li>)}</ul></section>}
            <Note>Changing a published course definition creates a new curriculum version. Existing offerings and results keep the version they were created under.</Note></>,save:d => {
                const entry = {...(c ?? {code:val(d,'Course code'),title:val(d,'Course title'),state:'draft',type:'Compulsory',department:''}),units:Number(val(d,'Credit units')),level:Number(val(d,'Level')),semester:Number(val(d,'Semester').slice(-1)),description:val(d,'Description'),prereq:val(d,'Prerequisites')===prerequisite.title?prerequisite.code:val(d,'Prerequisites')};
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
        {tab===0 && <Records tableClass="[&_th:last-child]:w-[90px] [&_td:last-child]:text-right" title="Course catalogue" subtitle="Approved and draft course definitions with credit units, prerequisites and level placement" actions={<>{status(`${courses.length} courses`)}<Action size="sm" variant="primary" icon="plus" onClick={() => courseForm()}>Add course</Action></>} columns={['Code','Title','Units','Level','Type','Prerequisite','State','']} rows={courses.map(c => [<code className="text-xs font-medium text-ink-700">{c.code}</code>,<span className="font-medium text-ink-800">{c.title}</span>,<span className="text-[13px]">{c.units}</span>,<span className="text-[13px] text-ink-500">L{c.level} S{c.semester}</span>,status(c.type,c.type==='Compulsory'?'emerald':'slate'),<span className="text-[13px] text-ink-500">{c.prereq}</span>,status(c.state,c.state==='published'?'sky':undefined),<Action size="sm" onClick={() => courseForm(c)}>Open</Action>])}/>}
        {tab===1 && <Records tableClass="[&_th:last-child]:w-[150px] [&_td:last-child]:text-right" title="Curriculum versions" subtitle="Approved versions are retained; changes create a new version rather than overwriting" columns={['Code','Programme','Level','Units','Version','Approved','']} rows={versions.map(p => [p.code,p.title,status(`L${p.level}`),p.units,status(p.version,p.version==='v2 approved'?'emerald':'amber'),p.approved,<Action size="sm" onClick={() => desk.show({title:`Outcome mapping for ${p.title}`,subtitle:`Version ${p.revision} · approved ${p.approved}`,submit:'Submit mapping',message:'Mapping submitted for approval',body:<><Card title="Programme outcomes"><ol className="space-y-2 text-sm">{programmeOutcomes.map((o,i) => <li key={o}><code>PO{i+1}</code>　{o}</li>)}</ol></Card><Note>Each mapping change is versioned. QA reports the approved structure for the current session.</Note></>,save:() => setVersions(vs => vs.map(v => v.id===p.id?{...v,version:'Awaiting approval'}:v))})}>Map outcomes</Action>])}/>}
        {tab===2 && <Card title="Course outcome to programme outcome mapping" subtitle="Weight: 0 none, 1 introduced, 2 reinforced, 3 mastered" actions={<>{status('NUC CCMAS format','emerald')}<Action size="sm" icon="download" onClick={() => exportRecords('outcome-matrix',matrix)}>Export matrix</Action></>}>
            <OutcomeMatrix {...{matrix, columns}}/></Card>}
    </Register>;
}
