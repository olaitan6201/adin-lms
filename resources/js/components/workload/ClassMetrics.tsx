import type { ClassDetails, ClassTotals, WorkloadTotals } from './contracts';

type MetricProps = {
    label: string;
    value: string;
};

function Metric({ label, value }: MetricProps) {
    return (
        <div className="min-w-0 border-t py-3">
            <dt className="text-sm font-medium text-muted-foreground">{label}</dt>
            <dd className="mt-1 text-2xl font-semibold tabular-nums text-foreground">{value}</dd>
        </div>
    );
}

export function Totals({ totals }: { totals: ClassTotals | WorkloadTotals }) {
    const metrics = [
        ['Registered enrolments', String(totals.enrolled)],
        ['Completed enrolments', String(totals.completed)],
        ['Released results', String(totals.released_results)],
    ];
    if ('average_percent' in totals) {
        metrics.push([
            'Average released score',
            totals.average_percent === null ? 'Not released' : `${totals.average_percent}%`,
        ]);
    }

    return (
        <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {metrics.map(([label, value]) => (
                <Metric key={label} label={label} value={value} />
            ))}
        </dl>
    );
}

export function CourseMeta({ course }: { course: ClassDetails }) {
    return (
        <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
            <div>
                <dt className="text-muted-foreground">Term</dt>
                <dd className="mt-1 font-medium text-foreground">{course.term ?? 'Not assigned'}</dd>
            </div>
            <div>
                <dt className="text-muted-foreground">Section</dt>
                <dd className="mt-1 font-medium text-foreground">{course.section ?? 'Not assigned'}</dd>
            </div>
            <div>
                <dt className="text-muted-foreground">Credit units</dt>
                <dd className="mt-1 font-medium text-foreground">{course.credits ?? 'Not assigned'}</dd>
            </div>
            <div>
                <dt className="text-muted-foreground">Status</dt>
                <dd className="mt-1 font-medium capitalize text-foreground">{course.status.replaceAll('_', ' ')}</dd>
            </div>
        </dl>
    );
}

export function PerformanceNote() {
    return (
        <p className="mt-5 max-w-3xl text-sm leading-6 text-muted-foreground">
            Performance uses active enrolments and the latest approved, published result revision only. Unreleased
            results are excluded.
        </p>
    );
}
