import type { ReactNode } from 'react';

export function InsightPanel({
    title,
    subtitle,
    children,
}: {
    title: string;
    subtitle?: ReactNode;
    children: ReactNode;
}) {
    return (
        <section aria-label={title} className="card min-w-0">
            <header className="card-head">
                <div>
                    <h2 className="card-title">{title}</h2>
                    {subtitle && <p className="card-subtitle">{subtitle}</p>}
                </div>
            </header>
            <div className="card-pad min-w-0">{children}</div>
        </section>
    );
}

type RatioRingProps = {
    percent: number;
    label: string;
};

export function RatioRing({ percent, label }: RatioRingProps) {
    return (
        <div
            role="img"
            aria-label={`${label}: ${percent}%`}
            className="relative grid size-20 shrink-0 place-items-center"
        >
            <svg viewBox="0 0 40 40" className="absolute inset-0 size-full -rotate-90" aria-hidden="true">
                <circle
                    cx="20"
                    cy="20"
                    r="17"
                    fill="none"
                    strokeWidth="3"
                    className="stroke-ink-100"
                />
                <circle
                    cx="20"
                    cy="20"
                    r="17"
                    fill="none"
                    strokeWidth="3"
                    pathLength="100"
                    strokeDasharray={`${Math.min(100, Math.max(0, percent))} 100`}
                    className="stroke-brand-600"
                />
            </svg>
            <strong aria-hidden="true" className="text-lg tabular-nums text-ink-900">
                {percent}%
            </strong>
        </div>
    );
}

export function MeasureBars({ values }: { values: Record<string, number> }) {
    const maximum = Math.max(1, ...Object.values(values));
    return (
        <dl className="grid gap-4">
            {Object.entries(values).map(([label, value]) => (
                <div key={label} className="grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-x-3">
                    <dt className="text-sm text-ink-600">{label}</dt>
                    <dd className="contents">
                        <span className="font-mono text-sm font-semibold tabular-nums">{value.toLocaleString()}</span>
                        <span
                            aria-hidden="true"
                            className="col-span-2 mt-1.5 h-2 overflow-hidden rounded-full bg-ink-100"
                        >
                            <span
                                className="block h-full rounded-full bg-brand-600"
                                style={{ width: `${(100 * value) / maximum}%` }}
                            />
                        </span>
                    </dd>
                </div>
            ))}
        </dl>
    );
}
