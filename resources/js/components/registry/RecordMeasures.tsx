type ProgressProps = {
    n: number;
    label?: string;
    stacked?: boolean;
};

export function Progress({ n, label, stacked }: ProgressProps) {
    if (stacked)
        return (
            <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-3 text-xs">
                    {label && <span className="font-medium text-ink-500">{label}</span>}
                    <span className="tnum font-semibold text-ink-700">{n}%</span>
                </div>
                <div
                    className="prog-track"
                    role="progressbar"
                    aria-label={label ?? 'Completion'}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={n}
                >
                    <div className="prog-fill" style={{ width: `${n}%` }} />
                </div>
            </div>
        );

    return (
        <span className="flex w-28 items-center gap-2">
            <span
                className="prog-track flex-1"
                role="progressbar"
                aria-label="Completion"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={n}
            >
                <span className="prog-fill block" style={{ width: `${n}%` }} />
            </span>
            <span className="text-[11px] font-medium text-ink-600">{n}%</span>
        </span>
    );
}

export function Metrics({ rows }: { rows: [string, string, string?][] }) {
    return (
        <div className={`mb-4 grid gap-3 ${rows.length === 4 ? 'sm:grid-cols-4' : 'sm:grid-cols-3'}`}>
            {rows.map(([label, value, hint]) => (
                <div key={label} className="rounded-xl border border-slate-100 p-3.5">
                    <p className="text-[11px] font-semibold uppercase text-slate-500">{label}</p>
                    <p className="mt-1 font-semibold">{value}</p>
                    <small className="text-slate-500">{hint}</small>
                </div>
            ))}
        </div>
    );
}
