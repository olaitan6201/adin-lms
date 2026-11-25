export type Activity = {
    offering: string;
    registers: number;
    uploads: number;
    marks: number;
};

export function TeachingFigures({ row }: { row: Omit<Activity, 'offering'> }) {
    return (
        <dl className="my-4 grid gap-4 sm:grid-cols-3">
            {(
                [
                    ['Classes with recorded attendance', row.registers],
                    ['File versions uploaded', row.uploads],
                    ['Score revisions recorded', row.marks],
                ] as const
            ).map(([label, value]) => (
                <div key={label} className="border-t pt-2">
                    <dt className="text-sm text-muted-foreground">{label}</dt>
                    <dd className="text-3xl font-semibold tracking-tight">{value}</dd>
                </div>
            ))}
        </dl>
    );
}
