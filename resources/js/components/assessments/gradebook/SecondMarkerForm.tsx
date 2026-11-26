import { useState } from 'react';
import type { GradeRow } from '@/types/assessments/gradebook';
import { inputClass } from '../Editor';
import { Note } from '@/components/ui/feedback/Note';
import { submitClass } from '../Editor';
import type { MarkerDecision } from './useGradebook';

type Props = {
    rows: GradeRow[];
    lecturer: boolean;
    save: (matric: string, decision: MarkerDecision, reason: string) => void;
};

export function SecondMarkerForm({ rows, lecturer, save }: Props) {
    const eligible = rows.filter(row => row.state !== 'published');
    const [matric, select] = useState(eligible[0]?.matric ?? '');
    const [decision, decide] = useState<MarkerDecision>(lecturer ? 'Send for moderation' : 'Approve');
    const [reason, explain] = useState('');
    if (!eligible.length) return <Note>No unpublished results are available for second marking.</Note>;

    return (
        <form className="grid gap-4" onSubmit={event => {
            event.preventDefault();
            save(matric, decision, reason);
        }}>
            <label>Student
                <select className={inputClass} value={matric} onChange={e => select(e.target.value)}>
                    {eligible.map(row => <option key={row.matric} value={row.matric}>{row.student} ({row.matric})</option>)}
                </select>
            </label>
            <label>Decision
                <select className={inputClass} value={decision} onChange={e => decide(e.target.value === 'Approve' ? 'Approve' : 'Send for moderation')}>
                    {!lecturer && <option>Approve</option>}
                    <option>Send for moderation</option>
                </select>
            </label>
            <label>Reason
                <textarea className={inputClass} required rows={4} value={reason} onChange={e => explain(e.target.value)} />
            </label>
            <button className={submitClass} disabled={!reason.trim()}>Save</button>
        </form>
    );
}
