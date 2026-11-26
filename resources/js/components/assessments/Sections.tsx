import { Card } from '@/components/ui/layout/Card';

interface SectionsProps {
    labels: string[];
    counts?: number[];
    active: number;
    change: (index: number) => void;
}

export function Sections({ labels, counts = [], active, change }: SectionsProps) {
    return (
        <Card bodyClassName="p-0">
            <div className="overflow-x-auto border-b border-ink-100" data-scroll>
                <nav aria-label="Page sections" className="flex min-w-max gap-1">
                    {labels.map((label, index) => {
                        const selected = active === index;
                        const tone = selected
                            ? 'border-brand-600 text-brand-800'
                            : 'border-transparent text-ink-500 hover:text-ink-800';
                        const count = counts[index];

                        return (
                            <button
                                key={label}
                                type="button"
                                aria-current={selected ? 'page' : undefined}
                                onClick={() => change(index)}
                                className={`whitespace-nowrap border-b-2 px-3.5 py-2.5 text-sm font-medium ${tone}`}
                            >
                                {label}
                                {count != null && (
                                    <span className="section-count tnum ml-1.5 rounded-full bg-ink-100 px-1.5 py-0.5 text-[11px] font-semibold text-ink-600">
                                        {count}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </nav>
            </div>
        </Card>
    );
}
