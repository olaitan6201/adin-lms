import { academicSessions, windows, healthScope, structureChecks } from '@/data/registry/academicStructure';
import { useState } from 'react';
import { Action } from '@/components/ui/controls/Action';
import { Card } from '@/components/ui/layout/Card';
import { Icon } from '@/components/icons/Icon';
import { Field, Note, Register, useDesk } from '@/components/registry/Desk';
import { cap, Details, Records, status, val } from '@/components/registry/Records';
import * as initial from '@/data/registry/institution';

export default function Structure() {
    const desk = useDesk();
    const [faculties, setFaculties] = useState(initial.faculties);
    const [programmes, setProgrammes] = useState(initial.programmes);
    const [sessions, setSessions] = useState(academicSessions);
    function addUnit() {
        desk.show({ title: 'Add faculty or department', submit: 'Add', body: <><Field label="Type" options={['Faculty','Department']}/><Field label="Name" required/><Field label="Code" required/><Field label="Head"/><Field label="Parent faculty" options={faculties.map(f => f.name)}/></>, save: d => {
            const unit = { id: crypto.randomUUID(), name: val(d,'Name'), code: val(d,'Code') };
            setFaculties(fs => val(d,'Type') === 'Faculty' ? [...fs,{ ...unit, head: val(d,'Head'), departments: [] }] : fs.map(f => f.name !== val(d,'Parent faculty') ? f : { ...f, departments: [...f.departments,{ ...unit, programmes: 0, lecturers: 0, students: 0 }] }));
        } });
    }
    function addProgramme() {
        desk.show({ title: 'Add programme', submit: 'Add programme', body: <><Field label="Programme" required/><Field label="Code" required/><Field label="Department" options={faculties.flatMap(f => f.departments.map(d => d.code))}/><Field label="Level" options={['100','200','300','400','500']}/><Field label="Units" type="number" required/></>, save: d => {
            const department = val(d,'Department');
            setProgrammes(ps => [...ps, { id: crypto.randomUUID(), code: val(d,'Code'), title: val(d,'Programme'), department, faculty: faculties.find(f => f.departments.some(v => v.code === department))?.code ?? '', level: Number(val(d,'Level')), units: Number(val(d,'Units')) }]);
        } });
    }
    function manage(s: typeof sessions[number]) {
        desk.show({ title: `${s.label} session settings`, subtitle: 'Dates, semesters and reporting cut-offs', cancel:'Cancel', submit: 'Save changes', message: 'Session settings saved', body: <><Field label="Session label" value={s.label} required/><div className="grid grid-cols-2 gap-3"><Field label="Resumption date" type="date" value={s.startDate} required/><Field label="Session end" type="date" value={s.endDate} required/></div><Field label="Semester" value={s.semester} options={['First Semester','Second Semester']}/><section className="rounded-xl border border-ink-100 p-4"><p className="text-[13px] font-semibold">Semester windows</p><Details entries={windows}/></section><Note>Roster imports and result publication are scoped to the active session. Changing these dates does not alter historical records.</Note></>, save: d => setSessions(ss => ss.map(v => v.id !== s.id ? v : { ...v, label: val(d,'Session label'), startDate: val(d,'Resumption date'), endDate: val(d,'Session end'), start: val(d,'Resumption date'), end: val(d,'Session end'), semester: val(d,'Semester') })) });
    }
    return <Register title="Academic structure" eyebrow="Academic organisation" description="The hierarchy that scopes every other module: oversight, rosters, curricula and reporting all resolve through it." overlay={desk.overlay} actions={<><Action icon="upload" onClick={() => desk.show({title:'Import structure',body:<Field label="Structure file" type="file" required/>,submit:'Import',message:'Structure file selected for review'})}>Import structure</Action><Action icon="plus" variant="primary" onClick={addUnit}>Add faculty or department</Action></>}>
        <div className="grid gap-5 xl:grid-cols-12"><div className="min-w-0 xl:col-span-8"><Card title="Institution hierarchy" subtitle="Faculty, department and programme assignment" actions={<>{status(`${faculties.length} faculties`,'emerald')}{status(`${faculties.flatMap(f => f.departments).length} departments`)}{status(`${programmes.length} programmes`)}</>}>
            <div className="space-y-4">{faculties.map(f => <section key={f.id} className="rounded-xl border border-slate-100 bg-white p-4"><div className="flex flex-wrap justify-between gap-3"><div className="flex gap-3"><b className="grid size-9 place-items-center rounded-lg bg-slate-900 text-[11px] text-white">{f.code}</b><div><p className="text-sm font-semibold">{f.name}</p><p className="text-xs text-slate-500">Head: {f.head} · {f.departments.length} departments</p></div></div>
                <Action icon="shield" variant="ghost" size="sm" onClick={() => desk.show({title:'Oversight scope',subtitle:f.name,body:<Details entries={[['Dean',f.head],['Departments',f.departments.map(d => d.name).join(', ')]]}/>})}>Oversight scope</Action></div>
                <ul className="mt-4 space-y-2">{f.departments.map(d => <li key={d.id} className="rounded-lg border border-slate-100 bg-slate-50/60 p-3"><div className="flex flex-wrap items-center justify-between gap-2"><span className="flex items-center gap-2.5 text-[13px] font-medium"><b className="grid size-7 place-items-center rounded-md bg-white text-[10px]">{d.code}</b>{d.name}</span><small className="text-slate-500">{d.programmes} programmes　|　{d.lecturers} lecturers　|　{d.students} students</small></div><div className="mt-2.5">{programmes.filter(p => p.department === d.code).map(p => <span key={p.id}>{status(`${p.code} L${p.level}`)}</span>)}</div></li>)}</ul>
            </section>)}</div></Card></div>
            <div className="xl:col-span-4"><Card title="Structure health" subtitle="Checks run on the current structure"><div className="space-y-3">{structureChecks.map(check => <div key={check.result} className={`flex items-start gap-2.5 rounded-xl border p-3 ${check.result==='pass'?'border-brand-200 bg-brand-50/60 text-brand-900':'border-amber-200 bg-amber-50/60 text-amber-900'}`}><Icon name={check.result==='pass'?'check':'alert'} className="mt-0.5 size-4 shrink-0"/><div><p className="text-[13px] font-semibold">{check.title}</p><p className="mt-0.5 text-xs">{check.detail}</p></div></div>)}<div className="rounded-xl border p-3.5"><Details entries={healthScope}/></div></div></Card></div></div>
        <Records title="Programmes" subtitle="Programme register across the three faculties" actions={<Action size="sm" icon="plus" onClick={addProgramme}>Add programme</Action>} columns={['Code','Programme','Level','Units','Department']} rows={programmes.map(p => [<code className="text-xs font-medium text-ink-700">{p.code}</code>,<span className="font-medium text-ink-800">{p.title}</span>,status(`Level ${p.level}`),<span className="text-[13px] text-ink-500">{p.units} units</span>,<span className="text-[13px] text-ink-500">{p.department}</span>])}/>
        <Records tableClass="[&_th:last-child]:w-[110px] [&_td:last-child]:text-right" title="Academic sessions and semesters" subtitle="Session windows drive roster scope, course delivery and reporting periods" columns={['Session','State','Window','Semesters','']} rows={sessions.map(s => [<span className="font-medium text-ink-800">{s.label}</span>,status(cap(s.state)),<span className="text-[13px] text-ink-500">{s.start} to {s.end}</span>,<span className="text-[13px] text-ink-500">{s.state === 'active' ? 'Semester 1 and 2' : 'Semesters 1 and 2'}</span>,<Action size="sm" onClick={() => manage(s)}>Manage</Action>])}/>
        <Note>Oversight scopes are inherited: a dean sees every department in the faculty, a head of department sees only their own department. Scope changes take effect on the next login.</Note>
    </Register>;
}
