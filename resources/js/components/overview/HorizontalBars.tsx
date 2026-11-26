export function HorizontalBars({
    items,
}: {
    items: readonly {
        label: string;
        value: number;
        color: string;
    }[];
}) {
    const max = Math.max(...items.map((i) => i.value), 1);
    return (
        <div>
            {items.map((i) => (
                <div key={i.label} className="grid grid-cols-[minmax(0,1fr)_56px] items-center gap-3 py-1.5">
                    <div className="min-w-0">
                        <p className="mb-1 truncate text-[13px] font-medium text-ink-700">{i.label}</p>
                        <div className="h-2 overflow-hidden rounded-full bg-ink-100">
                            <div
                                className="h-full rounded-full"
                                style={{ width: `${(100 * i.value) / max}%`, background: i.color }}
                            />
                        </div>
                    </div>
                    <span className="text-right text-[13px] font-semibold text-ink-800 tnum">{i.value}</span>
                </div>
            ))}
        </div>
    );
}
