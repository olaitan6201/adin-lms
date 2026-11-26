import { useEffect, useState } from 'react';
import { Action } from '@/components/ui/controls/Action';
import { Badge } from '@/components/ui/data-display/Badge';
import { Card } from '@/components/ui/layout/Card';
import { Icon } from '@/components/icons/Icon';
import { PageHeader } from '@/components/ui/layout/PageHeader';
import { Table } from '@/components/ui/data-display/Table';
import type { Session, Learner, AttendanceBand } from '@/types/assessments/attendance';
import { Drawer, RecordName, Sections, Status, exportSheet } from './Controls';

type Marks = Record<string, string>;
const statuses = ['present', 'late', 'absent', 'excused'];
function initialMarks(s: Session, roster: Learner[]): Marks {
    return Object.fromEntries(roster.map(r => [r.matric, s.state === 'scheduled' ? '' : r.mark]));
}
function count(marks: Marks, state: string) {
    return Object.values(marks).filter(v => v === state).length;
}

function Register({ session, initial, close, save, roster, codeSuffix }: { roster: Learner[]; codeSuffix: string; session: Session; initial: Marks; close: () => void; save: (v: Marks) => void }) {
    const [marks, setMarks] = useState(initial);
    const [code, setCode] = useState(`${session.course}-${codeSuffix}`);
    useEffect(() => {
        const id = window.setInterval(() => setCode(`${session.course}-${crypto.randomUUID().slice(0, 6).toUpperCase()}`), 60_000);
        return () => window.clearInterval(id);
    }, [session.course]);
    return <Drawer title={session.title} subtitle={`${session.course} · ${session.date}, ${session.time}`} close={close}>
        <Card title="Register" subtitle={`${session.present + session.late + session.absent} enrolled students`} actions={<><Action size="sm" onClick={() => setMarks(Object.fromEntries(Object.keys(marks).map(k => [k, 'present'])))}>All present</Action><Action size="sm" variant="primary" onClick={() => save(marks)}>Save register</Action></>}>
            <div className="divide-y divide-slate-100">{roster.map(r => <fieldset key={r.matric} className="py-3"><legend className="float-left mr-2 font-medium">{r.name}</legend>
                <div className="flex clear-both flex-wrap gap-1 pt-2">{statuses.map(s => <label key={s} className={`rounded-md border px-2 py-1 text-xs capitalize ${marks[r.matric] === s ? 'border-brand-600 bg-brand-50' : 'border-ink-100'}`}>
                    <input type="radio" className="mr-1" name={r.matric} checked={marks[r.matric] === s} onChange={() => setMarks({ ...marks, [r.matric]: s })}/>{s}</label>)}</div>
            </fieldset>)}</div>
        </Card><Card title="Controlled verification" subtitle="Optional QR check-in for the session">
            <div className="mb-3 flex items-center gap-4"><span className="rounded-xl bg-ink-900 p-4 text-white"><Icon name="qr" className="size-10"/></span><div><p className="text-sm font-medium">Session code <output>{code}</output></p><p className="my-2 text-sm text-ink-500">Refreshes every 60 seconds. A scan records the time and the device, and marks the student present.</p></div></div>
            <Action size="sm" onClick={() => setCode(`${session.course}-${crypto.randomUUID().slice(0, 6).toUpperCase()}`)}>Refresh code</Action>
        </Card><p className="rounded-lg bg-sky-50 p-3 text-sm">A student marked excused keeps the session in their history but it does not count against their percentage.</p><div className="flex justify-end gap-2"><Action onClick={close}>Close</Action><Action variant="primary" onClick={() => save(marks)}>Save register</Action></div>
    </Drawer>;
}

export default function AttendanceDesk({ lecturer = false, attendanceSessions, learners, bands, sessionCount, roster, codeSuffix }: { lecturer?: boolean; attendanceSessions: Session[]; learners: Learner[]; bands: readonly AttendanceBand[]; sessionCount: number; roster: Learner[]; codeSuffix: string }) {
    const [tab, setTab] = useState(0);
    const [rows, setRows] = useState(attendanceSessions);
    const [session, open] = useState<Session>();
    const [registers, setRegisters] = useState<Record<string, Marks>>({});
    const report = <Action icon="chart" onClick={() => exportSheet('attendance', ['Class', 'Date', 'Present', 'Absent', 'Late'], rows.map(s => [s.title, s.date, s.present, s.absent, s.late]))}>Attendance report</Action>;
    return <div className="assessment-view space-y-5"><PageHeader eyebrow="Attendance" title="Attendance" description={lecturer ? 'Take a register for your classes and keep an eye on students whose attendance is slipping.' : 'Institution-wide attendance monitoring with per-student history and threshold alerts.'} actions={<>{report}<Action variant="primary" icon="calendarCheck" disabled={!rows.length} onClick={() => open(rows[0])}>Open register</Action></>}/>
        <Sections counts={[rows.length]} labels={['Class registers', 'Per-student history']} active={tab} change={setTab}/>
        {tab === 0 ? <><Card className="session-list" title="Class registers" subtitle="One register per scheduled class, with the source of the mark recorded" actions={<><Badge>{rows.length} sessions this week</Badge>{report}</>}>
            <Table columns={['Class', 'Method', 'Present', 'Absent', 'Late', 'State', '']} rows={rows.map(s => [<RecordName name={s.title} meta={`${s.course} · ${s.date} · ${s.time}`}/>, <Badge tone={s.method === 'QR' ? 'sky' : 'slate'}>{s.method}</Badge>, <span className="text-brand-700">{s.present}</span>, s.absent, <span className="text-amber-700">{s.late}</span>, <Badge tone={s.state === 'closed' ? 'emerald' : s.state === 'open' ? 'amber' : 'slate'}>{s.state.charAt(0).toUpperCase() + s.state.slice(1)}</Badge>, <Action size="sm" onClick={() => open(s)}>{s.state === 'scheduled' ? 'Plan' : 'Register'}</Action>])}/>
        </Card><Card title="Attendance distribution" subtitle="Students by attendance band across the semester">
            {bands.map(([label, n, color]) => <div key={label} className="grid grid-cols-[minmax(0,1fr)_48px] items-center gap-3 py-1.5"><div><p className="text-sm">{label}</p><div className="mt-1 h-2 rounded bg-ink-100"><div className={`h-full rounded ${color}`} style={{ width: `${n / bands.reduce((sum, b) => sum + b[1], 0) * 100}%` }}/></div></div><strong className="text-right text-[13px]">{n}</strong></div>)}
            <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50/60 p-3.5 text-[13px] text-amber-900"><strong>{bands.at(-1)?.[1]} students below 50%</strong><p className="mt-1 text-xs leading-relaxed text-amber-800/90">Heads of department are notified for students below the threshold, and the register export is attached to that notification.</p></div>
        </Card></> : <Card title="Per-student history" subtitle="Attendance across all registered courses this semester"><Table columns={['Student', 'Percentage', 'Sessions', 'Standing']} rows={learners.map(r => [
            <RecordName name={r.name} meta={r.matric}/>, `${r.percent}%`, `${Math.round(r.percent * sessionCount / 100)} / ${sessionCount}`, <Badge tone={r.percent < 50 ? 'rose' : r.percent < 75 ? 'amber' : 'emerald'}>{r.percent < 50 ? 'Below threshold' : r.percent < 75 ? 'Watch' : 'Good'}</Badge>,
        ])}/></Card>}
        {session && <Register roster={roster} codeSuffix={codeSuffix} key={session.id} session={session} initial={registers[session.id] ?? initialMarks(session, roster)} close={() => open(undefined)} save={v => {
            if (!session) return;
            const original = registers[session.id] ?? initialMarks(session, roster);
            const total = (s: 'present' | 'absent' | 'late') => Math.max(0, session[s] + count(v, s) - count(original, s));
            setRegisters({ ...registers, [session.id]: v });
            setRows(rows.map(r => r.id === session.id ? { ...r, present: total('present'), absent: total('absent'), late: total('late'), state: r.state === 'scheduled' ? 'open' : r.state } : r));
            open(undefined);
        }}/>}
    </div>;
}
