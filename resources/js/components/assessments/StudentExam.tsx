import { useState } from 'react';
import { Action } from '@/components/ui/controls/Action';
import { Badge } from '@/components/ui/data-display/Badge';
import { Card } from '@/components/ui/layout/Card';
import { PageHeader } from '@/components/ui/layout/PageHeader';
import { workspaceUrl } from '@/lib/workspaceUrl';
import { Details, Drawer, Note, Status, inputClass } from './Controls';
import { paper } from './paper';
import { useExamAttempt } from './useExamAttempt';

export default function StudentExam() {
    const { attempt, remaining, stored, jump, flag, answer, submit } = useExamAttempt();
    const [confirm, setConfirm] = useState(false);
    const q = paper[attempt.index];
    const flagged = attempt.flags.includes(q.id);
    const answered = Object.values(attempt.answers).filter(v => v.trim()).length;
    const complete = attempt.submitted !== null;
    const submitButton = <Action icon="check" variant="primary" onClick={() => setConfirm(true)}>Submit examination</Action>;
    return <div className="space-y-5"><PageHeader eyebrow="ACC302 · Mid-term" title="ACC302 mid-term examination" description="Your responses are saved as you work. The paper closes automatically when the access window expires."
        actions={!complete && <><Action icon="save" href={stored ? workspaceUrl('student/overview') : undefined} disabled={!stored}>Save and exit</Action>{submitButton}</>}/>
        {complete ? <Card title="Examination submitted" subtitle="Local attempt receipt"><Details items={[['Paper', 'ACC302 mid-term examination'], ['Submitted', new Date(attempt.submitted!).toLocaleString()], ['Reason', attempt.submitted === attempt.deadline ? 'Access window expired' : 'Submitted by candidate'], ['Answered', `${answered} of ${paper.length}`], ['Record', stored ? 'Saved in this browser session' : 'In memory only; storage unavailable']]}/><Action href={workspaceUrl('student/overview')}>Return to dashboard</Action></Card>
            : <><div className="grid gap-5 xl:grid-cols-12"><div className="space-y-5 xl:col-span-4"><Card title="Access window">
                <div className="rounded-xl bg-ink-900 p-4 text-white"><p className="text-xs font-semibold uppercase tracking-wider">Time remaining</p><p role="timer" className="mt-1 font-mono text-3xl">
                    {`${Math.floor(remaining / 60)}`.padStart(2, '0')}:{`${remaining % 60}`.padStart(2, '0')}</p><p className="mt-2 text-xs">Auto-submits at 00:00</p></div>
                <p role="status" className="my-4 rounded-lg border border-ink-100 p-3 text-sm">{stored ? 'All responses saved in this browser session' : 'Local storage unavailable; keep this page open'}</p>
                <Details items={[['Paper', 'Drawn per candidate'], ['Attempts allowed', '1 of 1'], ['Total marks', '41'], ['Invigilation', 'Practice sitting']]}/>
            </Card><Card title="Question palette" subtitle="Answered, flagged and current"><div className="grid grid-cols-6 gap-2">{paper.map((item, i) => {
                const state = attempt.flags.includes(item.id) ? 'Flagged' : attempt.answers[item.id]?.trim() ? 'Answered' : 'Not answered';
                return <button key={item.id} type="button" aria-label={`Question ${i + 1}, ${state}`} aria-current={i === attempt.index ? 'step' : undefined} onClick={() => jump(i)}
                    className={`h-9 rounded-lg border text-sm font-semibold ${state === 'Flagged' ? 'bg-amber-300' : state === 'Answered' ? 'bg-brand-700 text-white' : 'border-ink-200'} ${i === attempt.index ? 'ring-2 ring-brand-600 ring-offset-2' : ''}`}>{i + 1}</button>;
            })}</div><div className="mt-4 flex flex-wrap gap-2 border-t pt-3"><Badge tone="emerald">Answered</Badge><Badge>Not answered</Badge><Badge tone="amber">Flagged</Badge></div></Card></div>
            <div className="min-w-0 space-y-5 xl:col-span-8"><Card title={`Question ${attempt.index + 1} of ${paper.length}`} subtitle="Answer every part. You may revisit a question at any time before the window closes." actions={<><Status value={q.type}/><Badge>{q.marks} mark{q.marks === 1 ? '' : 's'}</Badge></>}>
                <fieldset key={q.id} className="space-y-2"><legend className="mb-5 text-[15px] font-medium">{q.stem}</legend>
                    {q.options.length ? q.options.map(o => <label key={o} className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3.5 text-sm ${attempt.answers[q.id] === o ? 'border-brand-500 bg-brand-50' : 'border-ink-100'}`}>
                        <input type="radio" name={q.id} value={o} checked={attempt.answers[q.id] === o} onChange={() => answer(o)}/>{o}</label>) :
                    <textarea className={inputClass} aria-label={`Answer for question ${attempt.index + 1}`} rows={7} placeholder="Type your answer here" value={attempt.answers[q.id] ?? ''} onChange={e => answer(e.target.value)}/>}
                </fieldset><div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-ink-100 pt-4"><Action size="sm" icon="flag" aria-pressed={flagged} onClick={flag}>{flagged ? 'Flagged for review' : 'Mark for review'}</Action><small>{answered} of {paper.length} answered</small></div>
            </Card><Card bodyClassName="flex flex-wrap justify-between gap-2 p-4"><Action disabled={!attempt.index} onClick={() => jump(attempt.index - 1)}>Previous</Action>
                <div className="flex flex-wrap gap-2"><Action variant="ghost" onClick={() => answer('')}>Clear response</Action>{attempt.index < paper.length - 1 ? <Action variant="primary" onClick={() => jump(attempt.index + 1)}>Next question</Action> : submitButton}</div>
            </Card></div></div><Note>Answers are saved continuously in this browser session. Leaving the page does not pause the access window.</Note></>}
        {confirm && !complete && <Drawer title="Submit examination?" close={() => setConfirm(false)}><Details items={[['Answered', `${answered} of ${paper.length}`], ['Unanswered', paper.length - answered], ['Flagged for review', attempt.flags.length]]}/>
            <p>After submission you cannot change your answers.</p><Action onClick={() => setConfirm(false)}>Continue examination</Action> <Action variant="primary" onClick={submit}>Confirm submission</Action></Drawer>}
    </div>;
}
