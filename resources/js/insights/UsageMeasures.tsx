type Props = {
    rows: (string | number)[][];
};

export function UsageMeasures({ rows }: Props) {
    return <dl className="grid gap-3 sm:hidden">
        {rows.map(([label, count, period, rule]) => <div key={label} className="rounded-xl bg-ink-50 p-4">
            <dt className="kpi-label text-ink-600">{label}</dt>
            <dd>
                <strong className="block text-2xl tabular-nums">{count}</strong>
                <span className="text-sm text-muted-foreground block">{period}</span>
                <span className="mt-1 block text-sm text-ink-600">{rule}</span>
            </dd>
        </div>)}
    </dl>;
}
