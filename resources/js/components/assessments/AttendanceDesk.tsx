import { useEffect, useState } from 'react';
import { Action } from '@/components/ui/controls/Action';
import { Badge } from '@/components/ui/data-display/Badge';
import { Card } from '@/components/ui/layout/Card';
import { Icon } from '@/components/icons/Icon';
import { PageHeader } from '@/components/ui/layout/PageHeader';
import { Table } from '@/components/ui/data-display/Table';
import { attendanceSessions, learners } from './attendanceData';
import { Drawer, RecordName, Sections, Status, exportSheet } from './Controls';

type Session = typeof attendanceSessions[number];
type Marks = Record<string, string>;
const bands = [['90% and above', 48, 'bg-emerald-500'], ['70 to 89%', 62, 'bg-blue-500'], ['50 to 69%', 31, 'bg-amber-500'], ['Below 50%', 17, 'bg-rose-500']] as const;
const statuses = ['present', 'absent', 'late', 'excused'];
function initialMarks(s: Session): Marks {
    return Object.fromEntries(learners.slice(0, 6).map(r => [r.matric, s.state === 'scheduled' ? '' : r.mark]));
}
function count(marks: Marks, state: string) {
    return Object.values(marks).filter(v => v === state).length;
}

function Register({ session, initial, close, save }: { session: Session; initial: Marks; close: () => void; save: (v: Marks) => void }) {
    const [marks, setMarks] = useState(initial);
    const [code, setCode] = useState(`${session.course}-1209`);
    useEffect(() => {
        const id = window.setInterval(() => setCode(`${session.course}-${crypto.randomUUID().slice(0, 6).toUpperCase()}`), 60_000);
        return () => window.clearInterval(id);
    }, [session.course]);
    return <Drawer title={session.title} subtitle={`${session.course} · ${session.date}, ${session.time}`} close={close}>
        <Card title="Register" subtitle="Sample of enrolled students" actions={<Action size="sm" onClick={() => setMarks(Object.fromEntries(Object.keys(marks).map(k => [k, 'present'])))}>All present</Action>}>
            <div className="divide-y divide-slate-100">{learners.slice(0, 6).map(r => <fieldset key={r.matric} className="py-3"><legend className="float-left mr-2 font-medium">{r.name}</legend>
                <div className="flex clear-both flex-wrap gap-1 pt-2">{statuses.map(s => <label key={s} className={`rounded-md border px-2 py-1 text-xs capitalize ${marks[r.matric] === s ? 'border-brand-600 bg-brand-50' : 'border-ink-100'}`}>
                    <input type="radio" className="mr-1" name={r.matric} checked={marks[r.matric] === s} onChange={() => setMarks({ ...marks, [r.matric]: s })}/>{s}</label>)}</div>
            </fieldset>)}</div>
        </Card><Card title="Controlled verification" subtitle="Optional QR check-in for the session">
            <div className="mb-3 flex items-center gap-4"><span className="rounded-xl bg-ink-900 p-4 text-white"><Icon name="qr" className="size-10"/></span><div><p className="text-sm font-medium">Session code <output>{code}</output></p><p className="my-2 text-sm text-ink-500">Refreshes every 60 seconds.</p></div></div>
            <Action size="sm" onClick={() => setCode(`${session.course}-${crypto.randomUUID().slice(0, 6).toUpperCase()}`)}>Refresh code</Action>
        </Card><p className="rounded-lg bg-sky-50 p-3 text-sm">Excused sessions remain in the student’s history without counting against their percentage.</p><Action variant="primary" onClick={() => save(marks)}>Save register</Action>
    </Drawer>;
}

export default function AttendanceDesk({ lecturer = false }: { lecturer?: boolean }) {
    const [tab, setTab] = useState(0);
    const [rows, setRows] = useState(attendanceSessions);
    const [session, open] = useState<Session>();
    const [registers, setRegisters] = useState<Record<string, Marks>>({});
    const report = <Action icon="chart" onClick={() => exportSheet('attendance', ['Class', 'Date', 'Present', 'Absent', 'Late'], rows.map(s => [s.title, s.date, s.present, s.absent, s.late]))}>Attendance report</Action>;
    return <div className="space-y-5"><PageHeader eyebrow="Attendance" title="Attendance" description={lecturer ? 'Take a register for your classes and keep an eye on students whose attendance is slipping.' : 'Institution-wide attendance monitoring with per-student history and threshold alerts.'} actions={<>{report}<Action variant="primary" icon="calendarCheck" onClick={() => open(rows[0])}>Open register</Action></>}/>
        <Sections labels={[`Class registers (${rows.length})`, 'Per-student history']} active={tab} change={setTab}/>
        {tab === 0 ? <><Card title="Class registers" subtitle="One register per scheduled class, with the source of the mark recorded" actions={report}>
            <Table columns={['Class', 'Method', 'Present', 'Absent', 'Late', 'State', '']} rows={rows.map(s => [<RecordName name={s.title} meta={`${s.course} · ${s.date} · ${s.time}`}/>, s.method, s.present, s.absent, s.late, <Status value={s.state}/>, <Action size="sm" onClick={() => open(s)}>{s.state === 'scheduled' ? 'Plan' : 'Register'}</Action>])}/>
        </Card><Card title="Attendance distribution" subtitle="Students by attendance band across the semester">
            {bands.map(([label, n, color]) => <div key={label} className="grid grid-cols-[1fr_auto] items-center gap-4 py-2"><div><p className="text-sm">{label}</p><div className="mt-1 h-2 rounded bg-ink-100"><div className={`h-full rounded ${color}`} style={{ width: `${n / 62 * 100}%` }}/></div></div><strong>{n}</strong></div>)}
            <div className="mt-4 rounded-xl bg-amber-50 p-4 text-sm text-amber-900"><strong>17 students below 50%</strong><p>Heads of department are notified for students below the threshold, with the register export attached.</p></div>
        </Card></> : <Card title="Per-student history" subtitle="Attendance across all registered courses this semester"><Table columns={['Student', 'Percentage', 'Sessions', 'Standing']} rows={learners.map(r => [
            <RecordName name={r.name} meta={r.matric}/>, `${r.percent}%`, `${Math.round(r.percent * 12 / 100)} / 12`, <Badge tone={r.percent < 50 ? 'rose' : r.percent < 75 ? 'amber' : 'emerald'}>{r.percent < 50 ? 'Below threshold' : r.percent < 75 ? 'Watch' : 'Good'}</Badge>,
        ])}/></Card>}
        {session && <Register session={session} initial={registers[session.id] ?? initialMarks(session)} close={() => open(undefined)} save={v => {
            const original = registers[session.id] ?? initialMarks(session);
            const total = (s: 'present' | 'absent' | 'late') => Math.max(0, session[s] + count(v, s) - count(original, s));
            setRegisters({ ...registers, [session.id]: v });
            setRows(rows.map(r => r.id === session.id ? { ...r, present: total('present'), absent: total('absent'), late: total('late'), state: r.state === 'scheduled' ? 'open' : r.state } : r));
            open(undefined);
        }}/>}
    </div>;
}
