import type { GradeRow, Metric } from '@/types/assessments/gradebook';

type Props = {
    row: GradeRow;
    metric: Metric;
    adjust: (matric: string, metric: Metric, value: number) => void;
};

export function ScoreField({ row, metric, adjust }: Props) {
    const [key, label, maximum] = metric;
    return (
        <input
            aria-label={`${label} for ${row.student} (${row.matric})`}
            className="input tnum h-9 w-16 px-2 py-1 text-right"
            type="number"
            min={0}
            max={maximum}
            disabled={row.state === 'published'}
            defaultValue={row[key]}
            onBlur={({ currentTarget: input }) => {
                if (!input.value || !input.validity.valid) {
                    input.value = String(row[key]);
                    return;
                }

                adjust(row.matric, metric, input.valueAsNumber);
            }}
        />
    );
}
