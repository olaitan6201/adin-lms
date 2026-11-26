import { Action } from '@/components/ui/controls/Action';
import { Card } from '@/components/ui/layout/Card';

export function ScriptRubric({ rubric, maximum, values, score, start, change }: {
    rubric: string[];
    maximum: number[];
    values?: string[];
    score: number | null;
    start: () => void;
    change: (index: number, value: string) => void;
}) {
    const total = values?.every(value => value !== '') ? values.reduce((sum, value) => sum + Number(value), 0) : undefined;

    return (
        <Card title="Rubric" subtitle="Weighted criteria applied to this submission">
            {!values ? <>
                <p>No criterion marks recorded. {score !== null && `Recorded score: ${score} / 100.`}</p>
                <Action onClick={start}>Enter criterion marks</Action>
            </> : <>
                {rubric.map((criterion, index) => (
                    <label key={criterion} className="flex items-center justify-between gap-4 border-b py-2 text-sm">
                        {criterion}
                        <span className="flex items-center gap-2">
                            <input type="number" min={0} max={maximum[index]} step={1} value={values[index]}
                                aria-label={criterion} className="w-16 rounded border p-1"
                                onChange={event => change(index, event.target.value)} />
                            / {maximum[index]}
                        </span>
                    </label>
                ))}
                <p className="mt-3 flex justify-between border-t pt-3 font-semibold">
                    <span>Total</span>
                    <span>{total ?? '—'} / {maximum.reduce((sum, limit) => sum + limit, 0)}</span>
                </p>
            </>}
        </Card>
    );
}
