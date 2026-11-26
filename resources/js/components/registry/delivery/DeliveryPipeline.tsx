import { Card } from '@/components/ui/layout/Card';
import type { Offering } from '@/types/registry/delivery';

export function DeliveryPipeline({
    stages,
    filter,
    setFilter,
    list,
    offerings,
}: {
    stages: readonly (readonly [string, number, string])[];
    filter: string;
    setFilter: (filter: string) => void;
    list: Offering[];
    offerings: { code: string; students: number; state: string }[];
}) {
    return (
        <Card title="Delivery pipeline" subtitle="Where offerings sit in the approval to publication flow">
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                {stages.map(([name, count, hint]) => (
                    <button
                        type="button"
                        key={name}
                        aria-pressed={filter === name}
                        className="rounded-xl border border-ink-100 p-3.5 text-left hover:bg-ink-50"
                        onClick={() => setFilter(filter === name ? '' : name)}
                    >
                        <span className="flex items-center justify-between gap-2">
                            <strong className="text-[11px] font-semibold uppercase tracking-wider text-ink-400">
                                {name}
                            </strong>
                            <span
                                className={`size-2 rounded-full ${name === 'Draft' ? 'bg-ink-300' : name === 'Approved' ? 'bg-amber-500' : name === 'Published' ? 'bg-brand-500' : 'bg-sky-500'}`}
                            />
                        </span>
                        <p className="mt-2 text-2xl font-semibold">
                            {count +
                                list.filter((o) => o.state === name.toLowerCase()).length -
                                offerings.filter((o) => o.state === name.toLowerCase()).length}
                        </p>
                        <p className="mt-1 text-[11.5px] leading-relaxed text-ink-500">{hint}</p>
                    </button>
                ))}
            </div>
        </Card>
    );
}
