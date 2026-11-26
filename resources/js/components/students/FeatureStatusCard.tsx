import { Badge } from '@/components/ui/data-display/Badge';
import { Card } from '@/components/ui/layout/Card';

export function FeatureStatusCard({
    title,
    subtitle,
    items,
    supported,
}: {
    title: string;
    subtitle: string;
    items: {
        label: string;
        state: string;
    }[];
    supported: string;
}) {
    return (
        <Card title={title} subtitle={subtitle}>
            <ul className="divide-y divide-ink-100">
                {items.map((item) => (
                    <li key={item.label} className="flex items-center justify-between gap-3 py-2.5">
                        <span className="text-[13px] text-ink-700">{item.label}</span>
                        <Badge tone={item.state === supported ? 'emerald' : 'amber'}>{item.state}</Badge>
                    </li>
                ))}
            </ul>
        </Card>
    );
}
