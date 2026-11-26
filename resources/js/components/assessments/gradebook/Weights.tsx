import { useState } from 'react';
import { Action } from '@/components/ui/controls/Action';
import { Badge } from '@/components/ui/data-display/Badge';
import { Card } from '@/components/ui/layout/Card';
import type { GradePolicy } from '@/types/assessments/gradebook';
import { Details } from '../RecordDetails';

export function Weights({
    saved,
    save,
    policy: { gradeWeights, boundaries, rubric },
}: {
    policy: GradePolicy;
    saved: number[];
    save: (values: number[]) => void;
}) {
    const [weights, setWeights] = useState(saved);
    const [message, setMessage] = useState('');
    const total = weights.reduce((a, b) => a + b, 0);
    function savePolicy() {
        if (total !== 100) {
            setMessage('Weights must add up to 100%.');
            return;
        }

        save(weights);
        setMessage('Policy saved locally.');
    }

    function adjustWeight(index: number, value: number) {
        setWeights((previous) => previous.map((weight, position) => (position === index ? value : weight)));
        setMessage('');
    }

    return (
        <Card
            title="Assessment weights and grade boundaries"
            subtitle="Continuous assessment is split into assignments and quizzes (20) and participation (10)."
            actions={
                <>
                    <Badge tone={total === 100 ? 'emerald' : 'rose'}>Total {total}%</Badge>
                    <Action size="sm" variant="primary" onClick={savePolicy}>
                        Save policy
                    </Action>
                </>
            }
        >
            <div className="grid gap-4 lg:grid-cols-2">
                {gradeWeights.map((w, i) => (
                    <label key={w.item} className="rounded-xl border border-ink-100 p-4">
                        <span className="flex justify-between gap-2 font-semibold">
                            {w.item}
                            <span>{weights[i]}%</span>
                        </span>
                        <small>{w.source}</small>
                        <input
                            aria-label={`${w.item} weight`}
                            type="range"
                            className="my-3 block w-full accent-emerald-700"
                            min="0"
                            max="100"
                            value={weights[i]}
                            onChange={(e) => adjustWeight(i, e.target.valueAsNumber)}
                        />
                        <small>{w.policy}</small>
                    </label>
                ))}
            </div>
            <p role="status">{message}</p>
            <div className="mt-5 grid gap-5 lg:grid-cols-2">
                <Card
                    title="Boundaries for score edits"
                    subtitle="These sample boundaries calculate the grade when a score changes. The original grading policy is not specified for the sample records."
                >
                    <Details
                        items={boundaries.map(([grade, low], i) => [
                            grade,
                            `${low} – ${i ? boundaries[i - 1][1] - 1 : 100} · ${5 - i} points`,
                        ])}
                    />
                </Card>
                <Card title="Rubric" subtitle="Criterion level descriptors used for subjective marking">
                    <Details items={rubric} />
                </Card>
            </div>
        </Card>
    );
}
