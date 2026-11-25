type Props = {
    rows: (string | number)[][];
};

export function UsageMeasures({ rows }: Props) {
    return <dl className="divide-y border-y sm:hidden">
        {rows.map(([label, count, period, rule]) => <div key={label} className="py-3">
            <dt className="font-semibold">{label}</dt>
            <dd>
                <strong className="block text-2xl tabular-nums">{count}</strong>
                <span className="desk-note block">{period}</span>
                <span className="mt-1 block">{rule}</span>
            </dd>
        </div>)}
    </dl>;
}
