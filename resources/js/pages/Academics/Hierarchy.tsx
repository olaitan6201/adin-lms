import { Head, Link } from '@inertiajs/react';
import RecordForm, { field, type Choice, type Field } from '../../components/academics/RecordForm';
type Unit = Choice & {code: string; faculty_id?: string; department_id?: string};
type Calendar = {id: string; label: string; starts_on: string; ends_on: string};
type Props = {manage:boolean; faculties:Unit[]; departments:Unit[]; programmes:Unit[]; levels:Calendar[]; sessions:Calendar[]; semesters:(Calendar & {session_id:string; position:number})[]};
export default function Hierarchy({manage, faculties, departments, programmes, levels, sessions, semesters}:Props) {
    const names = [field('code','Code'), field('name','Name')];
    const dates = [{name:'starts_on',label:'Starts on',type:'date'}, {name:'ends_on',label:'Ends on',type:'date'}];
    const forms: [string,string,Field[]][] = [['faculty','faculties',names], ['department','departments',[field('faculty_id','Faculty',faculties),...names]],
        ['programme','programmes',[field('department_id','Department',departments),...names]], ['level','levels',[field('label','Level label')]],
        ['session','sessions',[field('label','Session label'),...dates]],['semester','semesters',[field('session_id','Session',sessions.map(s=>({id:s.id,name:s.label}))),field('position','Semester number'),...dates]]];
    return <main className="mx-auto max-w-3xl space-y-5 px-5 py-12"><Head title="Academic organisation"/><Link className="underline" href="/courses">My courses</Link>
        <h1 className="text-3xl font-semibold">Academic organisation</h1>
        <h2 className="text-xl font-semibold">Faculties and programmes</h2>{!faculties.length && <p>No faculties in scope.</p>}
        {faculties.map(f=><section key={f.id}><h3 className="font-semibold">{f.name} · {f.code}</h3>{departments.filter(d=>d.faculty_id===f.id).map(d=><details className="ml-4" key={d.id}><summary>{d.name}</summary>
            <ul>{programmes.filter(p=>p.department_id===d.id).map(p=><li key={p.id}>{p.code} · {p.name}</li>)}</ul>{manage && <RecordForm title="Delete department" action={`/academics/departments/${d.id}`} method="delete"/>}</details>)}</section>)}
        <h2 className="text-xl font-semibold">Calendar and levels</h2><p>Levels: {levels.map(l=>l.label).join(', ') || 'None configured'}</p>
        {!sessions.length && <p>No sessions configured.</p>}{sessions.map(s=><section key={s.id}><h3>{s.label} · {s.starts_on} – {s.ends_on}</h3><ul>{semesters.filter(t=>t.session_id===s.id).map(t=><li key={t.id}>Semester {t.position}: {t.starts_on} – {t.ends_on}</li>)}</ul></section>)}
        {manage && <section><h2 className="text-xl font-semibold">Configure organisation</h2>{forms.map(([label,path,fields])=><details className="border-b py-2" key={path}><summary>Add {label}</summary><RecordForm title={`Create ${label}`} action={`/academics/organisation/${path}`} fields={fields}/></details>)}</section>}
    </main>;
}
