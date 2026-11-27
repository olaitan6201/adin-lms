import type { AdminOverviewData } from '@/types/insights/adminOverview';

export function PercentageBars({ items }: { items: AdminOverviewData['participation']['metrics'] }) {
    return (
        <ul>
            {items.map(({ id, label, value, color }) => (
                <li key={id} className="grid grid-cols-[minmax(0,1fr)_56px] items-center gap-3 py-1.5">
                    <div className="min-w-0">
                        <p className="mb-1 text-[13px] font-medium text-ink-700">{label}</p>
                        <div className="h-2 overflow-hidden rounded-full bg-ink-100" aria-hidden="true">
                            <div
                                className="h-full rounded-full"
                                style={{ width: `${value}%`, background: color }}
                            />
                        </div>
                    </div>
                    <span className="text-right text-[13px] font-semibold text-ink-800 tnum">{value}%</span>
                </li>
            ))}
        </ul>
    );
}
