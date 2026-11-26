import { useState } from 'react';
import { Action } from '@/components/ui/controls/Action';
import { Badge } from '@/components/ui/data-display/Badge';
import { Card } from '@/components/ui/layout/Card';
import { Icon } from '@/components/icons/Icon';
import { PageHeader } from '@/components/ui/layout/PageHeader';
import { Table } from '@/components/ui/data-display/Table';
import { workspaceUrl } from '@/lib/workspaceUrl';
import type { Assignment, Receipt, Feedback } from '@/types/assessments/assignments';
import { Details, DrawerActive, Drawer, Note, RecordName, Status, inputClass } from './Controls';
import { submitClass } from './Editor';

const displayTitle = (a?: Assignment) => a?.shortTitle ?? a?.title;
function SubmissionPanel({ row, receipt, close, save, sizeLimit }: { sizeLimit: number; row: Assignment; receipt?: Receipt; close: () => void; save: (r: Receipt) => void }) {
    const [file, setFile] = useState<File>();
    const [note, setNote] = useState(receipt?.note ?? '');
    const [error, setError] = useState('');
    return <Drawer title={row.title} subtitle={`${row.course} · closes ${row.due}`} close={close}>
        <Card title="Instructions"><p>{row.instructions ?? `Submit your ${row.course} work for “${row.title}” in an accepted format.`}</p></Card>
        <form className="space-y-4" onSubmit={e => {
            e.preventDefault();
            if (row.state === 'closed') return;
            if (!file || !/\.(pdf|docx|xlsx)$/i.test(file.name) || file.size > sizeLimit * 1024 * 1024) return setError(`Choose a PDF, DOCX or XLSX file no larger than ${sizeLimit} MB.`);
            save({ number: `RCP-${crypto.randomUUID().slice(0, 8).toUpperCase()}`, file: file.name, size: `${(file.size / 1048576).toFixed(1)} MB`, time: new Date().toLocaleString(), note });
        }}>{row.state !== 'closed' && <label className="block rounded-xl border-2 border-dashed border-ink-200 p-5 text-sm font-medium" onDragOver={e => e.preventDefault()} onDrop={e => {
            e.preventDefault();
            setFile(e.dataTransfer.files[0]);
            setError('');
        }}>Drop your file here or browse
            <small className="block py-2">PDF, DOCX or XLSX up to {sizeLimit} MB</small><input className="max-w-full" type="file" accept=".pdf,.docx,.xlsx" required={!file} onChange={e => { setFile(e.target.files?.[0]); setError(''); }}/>{file && <span>{file.name}</span>}</label>}
            {receipt && <Card title="Existing submission"><p>{receipt.file} · {receipt.size} · uploaded {receipt.time}</p><p className="mt-2 font-mono text-xs">Receipt no. {receipt.number}</p></Card>}
            {row.state !== 'closed' && <><label className="block text-sm"><span className="text-[11px] font-semibold uppercase tracking-wider">Note to your lecturer</span><textarea className={inputClass} value={note} onChange={e => setNote(e.target.value)} placeholder="Optional message"/></label>
            {error && <p role="alert">{error}</p>}<Action onClick={close}>Cancel</Action> <button className={submitClass}>Submit work</button></>}</form>
    </Drawer>;
}

export default function StudentAssignments({ assignments, work, initial, courseReceipts, feedback, rules, sizeLimit }: { assignments: Assignment[]; work: Assignment[]; initial: Record<string, Receipt>; courseReceipts: Record<string, Receipt>; feedback: Feedback[]; rules: [string, string][]; sizeLimit: number }) {
    const [receipts, setReceipts] = useState(initial);
    const [row, setRow] = useState<Assignment>();
    const [script, setScript] = useState<typeof feedback[number]>();
    const [message, setMessage] = useState('');
    return <div className="assessment-view space-y-5"><PageHeader eyebrow="Assessment" title="Assignments" description="Upload your work before the closing time. Every upload issues a receipt that records the time and the file." actions={<Action icon="calendar" href={workspaceUrl('student/calendar')}>Academic calendar</Action>}/>
        {message && <p role="status" className="rounded-lg bg-brand-50 p-3">{message}</p>}
        <Card className="student-assignments" title="Your assignments" subtitle="Across all registered courses" actions={<Badge tone="amber">{work.filter(a => a.state !== 'closed').length} outstanding</Badge>}><Table columns={['Assignment', 'Due', 'Status', 'Score', '']} rows={work.map(a => [
            <RecordName name={a.title} meta={a.course}/>, a.due, <Status value={a.state === 'closed' ? 'Graded' : 'Submitted'}/>,
            a.publishedScore != null ? `${a.publishedScore} / 100` : '-', <div className="flex justify-end"><Action size="sm" onClick={() => setRow(a)}>View receipt</Action></div>,
        ])}/></Card><div className="grid gap-5 xl:grid-cols-3">
            <Card title="Submission rules" subtitle="Applied to the open assignment"><Details items={rules}/></Card>
            <Card title="Submitted work" subtitle="Your uploads and their receipts"><ul className="divide-y divide-ink-100">{assignments.filter(a => receipts[a.id]).map(a => <li key={a.id} className="flex items-start gap-3 py-3">
                <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-ink-50 text-ink-500"><Icon name="document" className="size-4"/></span>
                <button className="min-w-0 flex-1 text-left" onClick={() => setRow(a)}><span className="block truncate text-[13px] font-medium text-ink-800">{displayTitle(a)}</span><small className="mt-0.5 block text-[11.5px] text-ink-400">{receipts[a.id].time} · {receipts[a.id].size}</small></button>
                <Status value={feedback.some(f => f.id === a.id) ? `Graded ${feedback.find(f => f.id === a.id)?.score}` : 'Awaiting marking'}/></li>)}</ul></Card>
            <Card title="Feedback waiting" subtitle="Marked work returned to you"><div className="space-y-3">{feedback.map(f => <article key={f.id} className="rounded-xl border border-ink-100 p-3.5 text-sm">
                <p className="text-[13px] font-medium text-ink-800">{displayTitle(assignments.find(a => a.id === f.id))}</p><p className="mt-1 text-[13px] leading-relaxed text-ink-600">{f.text}</p><div className="mt-2 flex items-center gap-2"><Badge tone="emerald">{f.score} / 100</Badge><Action size="sm" onClick={() => setScript(f)}>Script</Action></div></article>)}</div></Card>
        </div><Note>A submitted file can be replaced until the closing time. Your score and any written feedback appear here once the lecturer has marked the work.</Note>
        <DrawerActive value={!!row}><SubmissionPanel sizeLimit={sizeLimit} key={row?.id ?? 'closed'} row={row ?? work[0]} receipt={receipts[(row ?? work[0]).id] ?? courseReceipts[(row ?? work[0]).id]} close={() => setRow(undefined)} save={r => {
            if (!row) return;
            setReceipts({ ...receipts, [row.id]: r });
            setMessage(`Work recorded locally. Receipt ${r.number} issued for ${r.file}.`);
            setRow(undefined);
        }}/></DrawerActive>
        {script && <Drawer title="Marked script" subtitle={assignments.find(a => a.id === script.id)?.title} close={() => setScript(undefined)}><Badge tone="emerald">{script.score} / 100</Badge><Card title="Marker feedback">{script.text}</Card></Drawer>}
    </div>;
}
