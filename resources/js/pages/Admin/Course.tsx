import { selectedCourse } from '@/data/registry/catalogue';
import { useState } from 'react';
import { Action } from '@/components/ui/controls/Action';
import { Card } from '@/components/ui/layout/Card';
import { Icon } from '@/components/icons/Icon';
import { Field, Note, Register, useDesk } from '@/components/registry/Desk';
import { Details, Progress, Records, status, val, cap } from '@/components/registry/Records';
import { courseModules } from '@/data/registry/academics';
import { gradeWeights } from '@/data/registry/assessment';
import { workspaceUrl } from '@/lib/workspaceUrl';

export default function Course() {
    const desk = useDesk();
    const [overview,setOverview] = useState(selectedCourse.overview);
    const [draft,setDraft] = useState(false);
    const {offering, definition} = selectedCourse;
    function edit() {
        desk.show({title:'Edit overview',subtitle:`${definition.code} · ${definition.title}`,submit:'Save draft',body:<>
            <Field label="Purpose" type="textarea" value={overview.purpose} required/><Field label="Course outline" type="textarea" value={overview.outline} required/><Field label="Entry requirement" value={overview.entry}/><Field label="Delivery mode" value={overview.delivery}/></>,save:d => {
                setOverview({...overview,purpose:val(d,'Purpose'),outline:val(d,'Course outline'),entry:val(d,'Entry requirement'),delivery:val(d,'Delivery mode')});
                setDraft(true);
            }});
    }
    return <Register title={`${definition.code} ${definition.title}`} eyebrow="Academic" description="The catalogue record a student, a lecturer and a reviewer all read from the same source." actions={<><Action icon="eye" href={workspaceUrl('student/course')}>Preview as student</Action><Action icon="edit" variant="primary" onClick={edit}>Edit course</Action></>} overlay={desk.overlay}>
        <Note>The overview, outline and outcome mapping shown here are the approved version for the {selectedCourse.session} session. Any change starts a new draft and requires re-approval before it reaches students.</Note>
        <Card title="Course overview" subtitle="The text a student reads before registering" actions={<>{status(draft?'Draft':'Published')}<Action icon="edit" size="sm" onClick={edit}>Edit overview</Action></>}>
            <div className="space-y-5">{[['Purpose',overview.purpose],['Course outline',overview.outline]].map(([label,value]) => <section key={label}><p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-ink-400">{label}</p><p className="mt-1.5 max-w-3xl text-[13.5px] leading-relaxed text-ink-700">{value}</p></section>)}
                <div className="grid gap-4 lg:grid-cols-2">{[['Entry requirement',overview.entry],['Delivery mode',overview.delivery]].map(([label,value]) => <Card key={label} title={label}><p className="text-[13px] leading-relaxed text-ink-700">{value}</p></Card>)}</div></div></Card>
        <Records title="Learning outcomes and programme mapping" subtitle="CCMAS mapping checked at approval and re-checked by quality assurance" actions={<Action size="sm" variant="primary" icon="target" href={workspaceUrl('admin/qa')}>Report approved structure for QA</Action>} columns={['Ref','Course learning outcome','Programme outcomes']} rows={overview.outcomes.map(o => [<code className="font-mono text-[11.5px] text-ink-500">{o.code}</code>,<span className="text-[13px] text-ink-700">{o.text}</span>,<code className="font-mono text-[11.5px] text-brand-700">{o.mapped}</code>])}/>
        <Records title="Course structure" subtitle="The weekly sequence published to students" actions={<Action size="sm" icon="document" href={workspaceUrl('admin/content')}>Open content library</Action>} columns={['Week','Topic','Items','Completion','State']} rows={courseModules.map(m => [<span className="text-[12.5px] font-medium text-ink-700">{m.week}</span>,<span className="text-[13px] text-ink-800">{m.title}</span>,<span className="text-[12.5px] text-ink-500">{m.items} items</span>,<Progress stacked n={m.completion}/>,status(cap(m.state),m.state==='draft'?'slate':'emerald')])}/>
        <Records title="Assessment plan" subtitle="An example policy, not a mandated default" actions={status(`Total ${gradeWeights.reduce((total,w) => total+w.weight,0)}%`,'emerald')} columns={['Component','Source','Weight','Policy']} rows={gradeWeights.map(w => [<span className="text-[13px] font-medium text-ink-800">{w.item}</span>,<span className="text-[13px] text-ink-600">{w.source}</span>,<span className="tnum text-[13px] font-semibold text-ink-900">{w.weight}%</span>,<span className="text-[12.5px] text-ink-500">{w.policy}</span>])}/>
        <Card title="Delivery record" subtitle="The offering this overview is attached to"><div className="grid gap-4 lg:grid-cols-2 [&_dt]:text-ink-500"><Details entries={[['Course code',<span className="font-mono text-[12.5px]">{definition.code}</span>],['Unit value',`${definition.units} units`],['Level',definition.level],['Semester',selectedCourse.semester],['Instructor',offering.instructor],['Registered students',offering.students],['Teaching weeks',offering.sessions],['Completion',`${offering.completion}%`]]}/>
            <Card title="Teaching team"><ul className="space-y-2">{overview.team.map(t => <li key={t} className="flex items-center gap-2 text-[13px] text-ink-700"><Icon name="user" className="size-4 text-ink-400"/>{t}</li>)}</ul><div className="mt-4 border-t border-ink-100 pt-3"><Progress stacked n={overview.materials.present} label={`Materials uploaded (${overview.materials.present} of ${overview.materials.required})`}/><p className="mt-2 text-[12px] text-amber-700">{overview.materials.missing} required materials outstanding</p></div></Card></div></Card>
    </Register>;
}
