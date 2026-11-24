import { Head, Link } from '@inertiajs/react';
import RecordForm, {field, type Choice} from '../../components/academics/RecordForm';
type Version = Choice & {version:number; status:string; framework_revision:string; approved_at:string|null; approved_by:string|null};
type Entry = {id:string; course_id:string; code:string; title:string; credits:string; outline:string; compulsory:boolean; description:string; semester_position:number; level_id:string};
type Outcome = {id:string; statement:string; curriculum_course_id?:string};
type Props = {edit:boolean;approve:boolean;versions:Version[];version:Version|null;entries:Entry[];levels:Choice[];programmes:Choice[];courseOutcomes:Outcome[];programmeOutcomes:Outcome[];mappings:{course_outcome_id:string;programme_outcome_id:string}[];prerequisites:{curriculum_course_id:string;required_course_id:string}[]};
export default function Catalogue({edit,approve,versions,version,entries,levels,programmes,courseOutcomes,programmeOutcomes,mappings,prerequisites}:Props) {
    const base='/academics/curriculum';
    const path=`${base}/${version?.id}`;
    const choices=entries.map(e=>({id:e.id,name:`${e.code}: ${e.title}`}));
    const outcomes=(rows:Outcome[])=>rows.map(o=>({id:o.id,name:o.statement}));
    const entryField=field('entry_id','Course',choices);
    const entryFields=[field('code','Catalogue code'),field('title','Title'),field('description','Description'),field('outline','Outline'),field('credits','Credits'),field('level_id','Level',levels),field('semester_position','Semester number'),field('compulsory','Requirement',[{id:'1',name:'Compulsory'},{id:'0',name:'Elective'}])];
    const draft=edit && version?.status==='draft';
    return <main className="mx-auto max-w-3xl space-y-5 px-5 py-12"><Head title="Curriculum catalogue"/><Link href="/courses" className="underline">My courses</Link>
        <h1 className="text-3xl font-semibold">Curriculum catalogue</h1>
        <nav aria-label="Curriculum versions"><h2 className="text-xl font-semibold">Programme versions</h2>{versions.length ? <ul>{versions.map(v=><li key={v.id}><Link className="underline" href={`${base}/${v.id}`}>{v.name} · v{v.version} · {v.status}</Link></li>)}</ul> : <p>No versions yet.</p>}</nav>
        {edit && <details><summary>Start a curriculum</summary><RecordForm title="Create draft" action={base} fields={[field('programme_id','Programme',programmes),field('framework_revision','CCMAS framework revision')]}/></details>}
        {version?.id && <><h2 className="text-xl font-semibold">{version.framework_revision} · v{version.version} ({version.status})</h2>
            {version.approved_at && <p className="break-words">Approved {version.approved_at} by {version.approved_by}</p>}
            {entries.map(e=><details key={e.id}><summary>{e.code} · {e.title}</summary><p>{e.description}</p><p>{e.outline}</p><p>{e.credits} credits · semester {e.semester_position} · {e.compulsory ? 'Compulsory' : 'Elective'}</p>
                <p>Prerequisites: {prerequisites.filter(p=>p.curriculum_course_id===e.id).map(p=>entries.find(c=>c.course_id===p.required_course_id)?.code).join(', ') || 'None'}</p>
                {draft && <RecordForm title="Save course" action={`${path}/entry`} fields={entryFields.map(f=>({...f,initial:f.name==='compulsory' ? (e.compulsory?'1':'0') : String(e[f.name as keyof Entry])}))}/>}</details>)}
            <h3 className="text-lg font-semibold">Outcome coverage</h3>{!courseOutcomes.length && !programmeOutcomes.length && <p>No outcomes recorded.</p>}
            <ul>{courseOutcomes.map(o=><li key={o.id}>{entries.find(e=>e.id===o.curriculum_course_id)?.code}: {o.statement} — {mappings.filter(m=>m.course_outcome_id===o.id).map(m=>programmeOutcomes.find(p=>p.id===m.programme_outcome_id)?.statement).join('; ') || 'Unmapped'}</li>)}
                {programmeOutcomes.map(o=><li key={o.id}>Programme: {o.statement} — {mappings.some(m=>m.programme_outcome_id===o.id)?'Mapped':'Unmapped'}</li>)}</ul>
            {draft && <><details><summary>Add catalogue course</summary><RecordForm title="Save course" action={`${path}/entry`} fields={entryFields}/></details>
                <details><summary>Configure prerequisites and outcomes</summary>
                    <RecordForm title="Add prerequisite" action={`${path}/prerequisite`} fields={[entryField,field('required_entry_id','Requires',choices)]}/>
                    <RecordForm title="Add course outcome" action={`${path}/course-outcome`} fields={[entryField,field('statement','Course outcome')]}/>
                    <RecordForm title="Add programme outcome" action={`${path}/programme-outcome`} fields={[field('statement','Programme outcome')]}/>
                    <RecordForm title="Map outcomes" action={`${path}/mapping`} fields={[field('course_outcome_id','Course outcome',outcomes(courseOutcomes)),field('programme_outcome_id','Programme outcome',outcomes(programmeOutcomes))]}/>
                </details><RecordForm title="Mark reviewed" action={`${path}/review`}/></>}
            {approve && version.status==='reviewed' && <RecordForm title="Approve reviewed version" action={`${path}/approve`}/>}
            {edit && version.status==='approved' && <RecordForm title="Edit as new draft" action={`${path}/fork`}/>}</>}
    </main>;
}
