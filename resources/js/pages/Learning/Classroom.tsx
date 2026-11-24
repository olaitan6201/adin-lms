import { Head, Link } from '@inertiajs/react';
import { EntryForm, localInput } from './EntryForm';
import type { Choice, Workspace, Session } from './contracts';

function Schedule({ action, session, materials }: { action: string; session?: Session; materials: Choice[] }) {
    return <details><summary>{session ? 'Edit session' : 'Schedule a class'}</summary><EntryForm action={action} label="Save session">
        <label>Class title<input name="title" required defaultValue={session?.title} /></label>
        <label>Starts (local time)<input type="datetime-local" name="starts_at" required defaultValue={localInput(session?.starts_at)} /></label>
        <label>Ends (local time)<input type="datetime-local" name="ends_at" required defaultValue={localInput(session?.ends_at)} /></label>
        <label>Meeting link (HTTPS)<input type="url" name="meeting_url" defaultValue={session?.meeting_url || ''} /></label>
        <label>Recording or alternative<select name="recording_material_id" defaultValue={session?.recording_material_id || ''}><option value="">None</option>{materials.map(m => <option key={m.id} value={m.id}>{m.title}</option>)}</select></label>
        <label>Status<select name="status" defaultValue={session?.status}>{['scheduled','held','cancelled'].map(s => <option key={s}>{s}</option>)}</select></label>
    </EntryForm></details>;
}
interface ClassroomProps extends Workspace { sessions: Session[]; percentage: number | null; materials: Choice[]; participants: { id: string; full_name: string }[] }
export default function Classroom({ base, title, staff, sessions, participants, percentage, materials }: ClassroomProps) {
    return <main className="mx-auto max-w-3xl space-y-5 px-5 py-10"><Head title={`${title} · Classroom`} /><Link className="underline" href={base}>Lessons and resources</Link>
        <header><p>{title}</p><h1 className="text-3xl font-semibold">Classroom and attendance</h1></header>
        <p>My attendance: {percentage === null ? 'No counted classes yet' : `${percentage}%`}. Counted classes are held sessions marked present or absent.</p>
        {staff && <Schedule action={`${base}/classes`} materials={materials} />}
        {!sessions.length && <p>No classes scheduled.</p>}
        {sessions.map(s => <section key={s.id} className="space-y-2 border-t pt-4"><h2 className="text-xl font-semibold">{s.title}</h2>
            <p>{new Date(s.starts_at).toLocaleString()} – {new Date(s.ends_at).toLocaleString()} · {s.status}</p>
            <p>My register: {s.mark || 'Not marked'}</p>
            {s.meeting_url && <p><a className="underline" href={s.meeting_url} rel="noreferrer">Join meeting</a></p>}
            {s.recording_material_id && <Link className="underline" href={`${base}#resource-${s.recording_material_id}`}>Recording or alternative</Link>}
            {staff && <><Schedule action={`${base}/classes/${s.id}`} session={s} materials={materials} />
                {s.status !== 'cancelled' && <details><summary>Record attendance</summary><EntryForm action={`${base}/classes/${s.id}/marks`} label="Save attendance">
                    <label>Participant<select required name="user_id" defaultValue=""><option value="">Select participant</option>{participants.map(p => <option key={p.id} value={p.id}>{p.full_name}</option>)}</select></label>
                    <label>Attendance<select name="status">{['present','absent','excused'].map(m => <option key={m}>{m}</option>)}</select></label>
                    <label>Reason for correction<input name="reason" /></label></EntryForm></details>}
                <a className="underline" href={`${base}/classes/${s.id}/register`}>Export register (CSV)</a></>}
        </section>)}
    </main>;
}
