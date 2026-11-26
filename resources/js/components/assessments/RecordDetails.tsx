import { type ReactNode } from 'react';
import { Badge } from '@/components/ui/data-display/Badge';

export function RecordName({ name, meta }: {
    name: string;
    meta: string;
}) {
    return (
        <div className="min-w-0">
            <p className="truncate font-medium text-ink-800">{name}</p>
            <p className="truncate font-mono text-[11px] text-ink-400">{meta}</p>
        </div>
    );
}

export function Status({ value }: { value: string }) {
    const tone = /open|approved|published|closed register|returned|marked|graded|present|Easy/i.test(value)
        ? 'emerald'
        : /late|moderation|awaiting|pending|restricted|flagged|not submitted|Medium/i.test(value)
          ? 'amber'
          : /scheduled|submitted|MCQ/i.test(value)
            ? 'sky'
            : 'slate';
    const label = value === 'moderation' ? 'In moderation' : value.charAt(0).toUpperCase() + value.slice(1);

    return <Badge tone={tone}>{label}</Badge>;
}

export function Details({ items }: { items: [string, ReactNode][] }) {
    return (
        <dl className="divide-y divide-ink-100">
            {items.map(([label, value]) => (
                <div key={label} className="flex items-center justify-between gap-3 py-2.5 text-[13px]">
                    <dt className="text-ink-600">{label}</dt>
                    <dd className="text-right font-medium text-ink-800">{value}</dd>
                </div>
            ))}
        </dl>
    );
}
