import { useState } from 'react';
import { Action } from '@/components/ui/controls/Action';
import { Badge } from '@/components/ui/data-display/Badge';
import { Card } from '@/components/ui/layout/Card';
import { PageHeader } from '@/components/ui/layout/PageHeader';
import { Table } from '@/components/ui/data-display/Table';
import { workspaceUrl } from '@/lib/workspaceUrl';
import { assignments } from '@/data/assessments/assignments';
import { Details, Drawer, Note, RecordName, Status, inputClass } from './Controls';
import { instructions, type Assignment } from './AssignmentPanels';
import { submitClass } from './Editor';

type Receipt = { number: string; file: string; time: string; note: string };
const initial: Record<string, Receipt> = {
    'as-1': { number: 'RCP-2026-11-12-0412-884', file: 'okonkwo_blessing_set3.pdf', time: '12 Nov 2026, 21:04', note: '' },
    'as-3': { number: 'RCP-2026-11-10-0412-762', file: 'mitosis-observation.pdf', time: '10 Nov 2026, 17:22', note: '' },
    'as-5': { number: 'RCP-2026-11-08-0412-516', file: 'titration.pdf', time: '08 Nov 2026, 09:15', note: '' },
};
const feedback = [
    { id: 'as-3', score: 74, text: 'Your diagram of the metaphase plate is clear. Link the observation to the cell cycle stage in the summary, which is where marks were lost.' },
    { id: 'as-5', score: 81, text: 'Well handled. Show the calculation of the concentration from the raw readings rather than only the final value.' },
];
function SubmissionPanel({ row, receipt, close, save }: { row: Assignment; receipt?: Receipt; close: () => void; save: (r: Receipt) => void }) {
    const [file, setFile] = useState<File>();
    const [note, setNote] = useState(receipt?.note ?? '');
    const [error, setError] = useState('');
    return <Drawer title={row.title} subtitle={`${row.course} · closes ${row.due}`} close={close}>
        <Card title="Instructions"><p>{row.id === 'as-1' ? instructions : `Submit your ${row.course} work for “${row.title}” in an accepted format.`}</p></Card>
        {receipt && <Card title="Existing submission"><p>{receipt.file} · uploaded {receipt.time}</p><p className="mt-2 font-mono text-xs">Receipt no. {receipt.number}</p></Card>}
        {row.state !== 'closed' && <form className="space-y-4" onSubmit={e => {
            e.preventDefault();
            if (!file || !/\.(pdf|docx|xlsx)$/i.test(file.name) || file.size > 25 * 1024 * 1024) return setError('Choose a PDF, DOCX or XLSX file no larger than 25 MB.');
            save({ number: `RCP-${crypto.randomUUID().slice(0, 8).toUpperCase()}`, file: file.name, time: new Date().toLocaleString(), note });
        }}><label className="block rounded-xl border-2 border-dashed border-ink-200 p-5 text-sm font-medium">Choose your file
            <small className="block py-2">PDF, DOCX or XLSX up to 25 MB</small><input className="max-w-full" type="file" accept=".pdf,.docx,.xlsx" required onChange={e => { setFile(e.target.files?.[0]); setError(''); }}/></label>
            <label className="block text-sm">Note to your lecturer<textarea className={inputClass} value={note} onChange={e => setNote(e.target.value)} placeholder="Optional message"/></label>
            {error && <p role="alert">{error}</p>}<button className={submitClass}>Submit work</button></form>}
    </Drawer>;
}

export default function StudentAssignments() {
    const [receipts, setReceipts] = useState(initial);
    const [row, setRow] = useState<Assignment>();
    const [script, setScript] = useState<typeof feedback[number]>();
    const [message, setMessage] = useState('');
    const work = assignments.slice(0, 4);
    return <div className="space-y-5"><PageHeader eyebrow="Assessment" title="Assignments" description="Upload your work before the closing time. Every upload issues a receipt that records the time and the file." actions={<Action icon="calendar" href={workspaceUrl('student/calendar')}>Academic calendar</Action>}/>
        {message && <p role="status" className="rounded-lg bg-brand-50 p-3">{message}</p>}
        <Card title="Your assignments" subtitle="Across all registered courses" actions={<Badge tone="amber">{work.filter(a => !receipts[a.id]).length} outstanding</Badge>}><Table columns={['Assignment', 'Due', 'Status', 'Score', '']} rows={work.map(a => [
            <RecordName name={a.title} meta={a.course}/>, a.due, <Status value={a.state === 'closed' ? 'Graded' : receipts[a.id] ? 'Submitted' : 'Not submitted'}/>,
            a.state === 'closed' ? '74 / 100' : '—', <Action size="sm" onClick={() => setRow(a)}>{receipts[a.id] ? 'View receipt' : 'Submit'}</Action>,
        ])}/></Card><div className="grid gap-5 xl:grid-cols-3">
            <Card title="Submission rules" subtitle="Applied to the open assignment"><Details items={[['Accepted formats', 'PDF, DOCX, XLSX'], ['Maximum file size', '25 MB'], ['Late submissions', 'Accepted, 10% penalty'], ['Revision', 'Until the closing time'], ['Individual or group', 'Individual']]}/></Card>
            <Card title="Submitted work" subtitle="Your uploads and their receipts"><ul className="divide-y divide-ink-100">{assignments.filter(a => receipts[a.id]).map(a => <li key={a.id} className="py-3">
                <button className="text-left text-sm font-medium hover:underline" onClick={() => setRow(a)}>{a.title}</button><p className="my-1 text-xs text-ink-500">{receipts[a.id].time}</p>
                <Status value={feedback.some(f => f.id === a.id) ? `Graded ${feedback.find(f => f.id === a.id)?.score}` : 'Awaiting marking'}/></li>)}</ul></Card>
            <Card title="Feedback waiting" subtitle="Marked work returned to you"><div className="space-y-3">{feedback.map(f => <article key={f.id} className="rounded-xl border border-ink-100 p-3 text-sm">
                <strong>{assignments.find(a => a.id === f.id)?.title}</strong><p className="my-2">{f.text}</p><Badge tone="emerald">{f.score} / 100</Badge> <Action size="sm" onClick={() => setScript(f)}>Script</Action></article>)}</div></Card>
        </div><Note>A submitted file can be replaced until the closing time. Your score and written feedback appear here once the lecturer has marked the work.</Note>
        {row && <SubmissionPanel row={row} receipt={receipts[row.id]} close={() => setRow(undefined)} save={r => {
            setReceipts({ ...receipts, [row.id]: r });
            setMessage(`Work recorded locally. Receipt ${r.number} issued for ${r.file}.`);
            setRow(undefined);
        }}/>}
        {script && <Drawer title="Marked script" subtitle={assignments.find(a => a.id === script.id)?.title} close={() => setScript(undefined)}><Badge tone="emerald">{script.score} / 100</Badge><Card title="Marker feedback">{script.text}</Card></Drawer>}
    </div>;
}
