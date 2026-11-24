import { Head, Link } from '@inertiajs/react';
import RecordForm, {field} from '../../components/academics/RecordForm';
type Offering={id:string;external_offering_id:string;status:string;section:string|null;curriculum_course_id:string|null;delivery_mode:string|null;semester_id:string|null;copied_from:string|null};
type Props={offerings:Offering[];entries:{id:string;title:string;code:string;name:string;version:number}[];terms:{id:string;label:string;position:number}[];modes:string[]};
export default function Delivery({offerings,entries,terms,modes}:Props) {
    return <main className="mx-auto max-w-3xl space-y-5 px-5 py-12"><Head title="Offering delivery"/><Link href="/courses" className="underline">My courses</Link>
        <h1 className="text-3xl font-semibold">Offering delivery</h1><p>Prepare an upstream section, assign its lecturer in the staff directory, then publish.</p>
        {!offerings.length && <p>No roster offerings yet.</p>}{offerings.map(o=>{
            const path=`/academics/delivery/${o.id}`;
            const prepare=['draft','unpublished'].includes(o.status);
            return <details key={o.id} className="rounded border p-3"><summary>{o.external_offering_id} · {o.status}</summary>
                <p>{entries.find(e=>e.id===o.curriculum_course_id)?.title ?? 'No approved course linked'} · {o.section ?? 'No section'} · {o.delivery_mode ?? 'No delivery mode'}</p>
                {o.copied_from && <p>Copied from {offerings.find(s=>s.id===o.copied_from)?.external_offering_id}</p>}
                {prepare && <><RecordForm title="Save academic details" action={`${path}/prepare`} fields={[
                    {...field('curriculum_course_id','Approved curriculum course',entries.map(e=>({id:e.id,name:`${e.code} · ${e.title} (${e.name} v${e.version})` }))),initial:o.curriculum_course_id ?? ''},
                    {...field('semester_id','Semester',terms.map(t=>({id:t.id,name:`${t.label} · semester ${t.position}`}))),initial:o.semester_id ?? ''},
                    {...field('section','Section'),initial:o.section ?? ''}, {...field('delivery_mode','Delivery mode',modes.map(m=>({id:m,name:m}))),initial:o.delivery_mode ?? ''}]}/>
                    <details><summary>Copy teaching structure from another term</summary><p>The receiving offering must be empty. Scheduled activities shift by the difference between semester start dates.</p>
                        <RecordForm title="Copy structure" action={`${path}/copy`} fields={[field('source_id','Source offering',offerings.filter(s=>s.id!==o.id).map(s=>({id:s.id,name:s.external_offering_id})))]}/></details>
                    <RecordForm title="Publish offering" action={`${path}/publish`}/></>}
                {o.status==='published' && <RecordForm title="Unpublish offering" action={`${path}/unpublish`}/>}
                {o.status!=='archived' && <details><summary>Archive permanently</summary><RecordForm title="Archive offering" action={`${path}/archive`}/></details>}
            </details>;})}
    </main>;
}
