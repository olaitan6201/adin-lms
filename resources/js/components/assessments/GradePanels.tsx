import { useState } from 'react';
import { Action, Badge, Card } from '@/components/workspace/Elements';
import { gradeRows, gradeWeights } from './gradeData';
import { Details } from './Controls';

export const boundaries: [string, number][] = [['A', 70], ['B', 60], ['C', 50], ['D', 45], ['E', 40], ['F', 0]];
export const stages = [
    ['entered', 'Entered', 'Scores recorded by the lecturer'], ['moderation', 'In moderation', 'Second marker reviewing'],
    ['approved', 'Approved', 'Signed off by the officer'], ['published', 'Published', 'Visible to students'],
];

export function Weights({ saved, save }: { saved: number[]; save: (values: number[]) => void }) {
    const [weights, setWeights] = useState(saved);
    const [message, setMessage] = useState('');
    const total = weights.reduce((a, b) => a + b, 0);
    return <Card title="Assessment weights and grading policy" subtitle="Configured by an authorised officer. Continuous assessment is split into assignments and quizzes (20) and participation (10)."
        actions={<><Badge tone={total === 100 ? 'emerald' : 'rose'}>Total {total}%</Badge><Action size="sm" variant="primary" onClick={() => {
            if (total !== 100) return setMessage('Weights must add up to 100%.');
            save(weights);
            setMessage('Policy saved locally.');
        }}>Save policy</Action></>}>
        <div className="grid gap-4 lg:grid-cols-2">{gradeWeights.map((w, i) => <label key={w.item} className="rounded-xl border border-ink-100 p-4">
            <span className="flex justify-between gap-2 font-semibold">{w.item}<span>{weights[i]}%</span></span><small>{w.source}</small>
            <input aria-label={`${w.item} weight`} type="range" className="my-3 block w-full accent-emerald-700" min="0" max="100" value={weights[i]} onChange={e => {
                setWeights(weights.map((n, j) => j === i ? Number(e.target.value) : n));
                setMessage('');
            }}/><small>{w.policy}</small></label>)}</div>
        <p role="status">{message}</p><div className="mt-5 grid gap-5 lg:grid-cols-2"><Card title="Grade boundaries"><Details items={boundaries.map(([grade, low], i) => [grade, `${low} – ${i ? boundaries[i - 1][1] - 1 : 100} · ${5 - i} points`])}/></Card>
            <Card title="Rubric" subtitle="Criterion level descriptors used for subjective marking"><Details items={[['Correct journal entry', '10 marks · 4 levels'], ['Correct ledger posting', '6 marks · 3 levels'], ['Trial balance extracted and balanced', '4 marks · 3 levels'], ['Presentation and clarity', '5 marks · 3 levels']]}/></Card></div>
    </Card>;
}

export function Moderation({ rows, filter }: { rows: typeof gradeRows; filter: (value: string) => void }) {
    return <div className="space-y-5"><Card title="Result workflow" subtitle="A score becomes a released result only after moderation and approval">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">{stages.map(([id, label, hint]) => <button key={id} className="rounded-xl border border-ink-100 p-4 text-left hover:bg-ink-50" onClick={() => filter(id)}>
            <small className="uppercase">{label}</small><strong className="my-2 block text-2xl">{rows.filter(r => r.state === id).length}</strong><small>{hint}</small>
        </button>)}</div></Card><Card title="Moderation rules"><div className="grid gap-4 lg:grid-cols-2">
            <div><strong>Automatic flags</strong><ul className="list-disc space-y-2 pl-5 text-sm"><li>Score differs from the section mean by more than 15 points.</li><li>Total changed by more than 10 points after entry.</li><li>Continuous assessment exceeds the configured weight.</li></ul></div>
            <div><strong>Release controls</strong><ul className="list-disc space-y-2 pl-5 text-sm"><li>Only an authorised officer can publish a result.</li><li>Publishing locks the result.</li><li>A later correction requires a new approved version.</li></ul></div>
        </div></Card></div>;
}
