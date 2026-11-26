import { useState } from 'react';
import { Action } from '@/components/ui/controls/Action';
import { Card } from '@/components/ui/layout/Card';
import { Icon } from '@/components/icons/Icon';
import { Field, Note, Register, useDesk } from '@/components/registry/Desk';
import { Details, Progress, Records, status, val, cap } from '@/components/registry/Records';
import { courseOverviews, courseModules, offerings } from '@/data/registry/academics';
import { gradeWeights } from '@/data/registry/assessment';
import { workspaceUrl } from '@/lib/workspaceUrl';

export default function Course() {
    const desk = useDesk();
    const [overview,setOverview] = useState(courseOverviews.ACC302);
    const [draft,setDraft] = useState(false);
    const offering = offerings[0];
    function edit() {
        desk.show({title:'Edit overview',subtitle:'ACC302 · Intermediate Financial Accounting',submit:'Save draft',body:<>
            <Field label="Purpose" type="textarea" value={overview.purpose} required/><Field label="Course outline" type="textarea" value={overview.outline} required/><Field label="Entry requirement" value={overview.entry}/><Field label="Delivery mode" value={overview.delivery}/></>,save:d => {
                setOverview({...overview,purpose:val(d,'Purpose'),outline:val(d,'Course outline'),entry:val(d,'Entry requirement'),delivery:val(d,'Delivery mode')});
                setDraft(true);
            }});
    }
    return <Register title="ACC302 Intermediate Financial Accounting" eyebrow="Academic" description="The catalogue record a student, a lecturer and a reviewer all read from the same source." actions={<><Action icon="eye" href={workspaceUrl('student/course')}>Preview as student</Action><Action icon="edit" variant="primary" onClick={edit}>Edit course</Action></>} overlay={desk.overlay}>
        <Note>The overview, outline and outcome mapping shown here are the approved version for the 2025/2026 session. Any change starts a new draft and requires re-approval before it reaches students.</Note>
        <Card title="Course overview" subtitle="The text a student reads before registering" actions={<>{status(draft?'Draft':'Published')}<Action icon="edit" size="sm" onClick={edit}>Edit overview</Action></>}>
            <div className="space-y-5">{[['Purpose',overview.purpose],['Course outline',overview.outline]].map(([label,value]) => <section key={label}><h3 className="text-[11px] font-semibold uppercase tracking-wider text-ink-400">{label}</h3><p className="mt-1.5 max-w-3xl text-[13.5px] leading-relaxed text-ink-700">{value}</p></section>)}
                <div className="grid gap-4 lg:grid-cols-2">{[['Entry requirement',overview.entry],['Delivery mode',overview.delivery]].map(([label,value]) => <Card key={label} title={label}><p className="text-[13px] leading-relaxed text-ink-700">{value}</p></Card>)}</div></div></Card>
        <Records title="Learning outcomes and programme mapping" subtitle="CCMAS mapping checked at approval and re-checked by quality assurance" actions={<Action size="sm" variant="primary" icon="target" href={workspaceUrl('admin/qa')}>Report approved structure for QA</Action>} columns={['Ref','Course learning outcome','Programme outcomes']} rows={overview.outcomes.map(o => [<code>{o.code}</code>,o.text,<code>{o.mapped}</code>])}/>
        <Records title="Course structure" subtitle="The weekly sequence published to students" actions={<Action size="sm" icon="document" href={workspaceUrl('admin/content')}>Open content library</Action>} columns={['Week','Topic','Items','Completion','State']} rows={courseModules.map(m => [m.week,m.title,`${m.items} items`,<Progress n={m.completion}/>,status(cap(m.state),m.state==='draft'?'slate':'emerald')])}/>
        <Records title="Assessment plan" subtitle="An example policy, not a mandated default" actions={status('Total 100%','emerald')} columns={['Component','Source','Weight','Policy']} rows={gradeWeights.map(w => [w.item,w.source,`${w.weight}%`,w.policy])}/>
        <Card title="Delivery record" subtitle="The offering this overview is attached to"><div className="grid gap-4 lg:grid-cols-2"><Details entries={[['Course code','ACC302'],['Unit value','3 units'],['Level','300'],['Semester','First'],['Instructor',offering.instructor],['Registered students',offering.students],['Teaching weeks',offering.sessions],['Completion',`${offering.completion}%`]]}/>
            <Card title="Teaching team"><ul className="space-y-2">{overview.team.map(t => <li key={t} className="flex items-center gap-2 text-[13px]"><Icon name="user" className="size-4 text-ink-400"/>{t}</li>)}</ul><div className="mt-4 border-t pt-3 text-xs">Materials uploaded ({overview.materials.present} of {overview.materials.required})<Progress n={overview.materials.present}/><p className="mt-2 text-amber-700">{overview.materials.missing} required materials outstanding</p></div></Card></div></Card>
    </Register>;
}
