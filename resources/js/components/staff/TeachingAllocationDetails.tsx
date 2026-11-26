import { Badge } from '@/components/ui/data-display/Badge';
import { Card } from '@/components/ui/layout/Card';

type Allocation = {
    workload: { label: string; value: string }[];
    preparation: { title: string; tone: string; state: string }[];
    bands: { label: string; value: number; color: string }[];
    cohortSize: number;
};

export function TeachingAllocationDetails({ allocation }: { allocation: Allocation }) {
    return (
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
            <Card title="Teaching workload" subtitle="Contact hours and assessment load this semester">
                <ul className="divide-y divide-ink-100">
                    {allocation.workload.map((item) => (
                        <li key={item.label} className="flex items-center justify-between gap-3 py-2.5">
                            <span className="text-[13px] text-ink-600">{item.label}</span>
                            <span className="text-[13px] font-semibold text-ink-800 tnum">{item.value}</span>
                        </li>
                    ))}
                </ul>
            </Card>
            <Card title="Course preparation" subtitle="What must be ready before the next class">
                <ul className="divide-y divide-ink-100">
                    {allocation.preparation.map((item) => (
                        <li key={item.title} className="flex items-center justify-between gap-3 py-2.5">
                            <span className="text-[13px] text-ink-700">{item.title}</span>
                            <Badge tone={item.tone}>{item.state}</Badge>
                        </li>
                    ))}
                </ul>
            </Card>
            <Card title="Your students" subtitle="Distribution of attention across cohorts">
                <div className="space-y-4">
                    {allocation.bands.map((band) => (
                        <div key={band.label}>
                            <div className="mb-1 flex items-center justify-between gap-3">
                                <span className="text-[13px] text-ink-600">{band.label}</span>
                                <span className="text-[13px] font-semibold text-ink-800 tnum">{band.value}</span>
                            </div>
                            <div className="h-2 w-full overflow-hidden rounded-full bg-ink-100">
                                <div
                                    className="h-full rounded-full"
                                    style={{ width: `${(band.value / allocation.cohortSize) * 100}%`, background: `${band.color}` }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    );
}
