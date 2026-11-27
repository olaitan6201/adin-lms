import type { ReactNode } from 'react';
import { Card } from '@/components/ui/layout/Card';

export function Section({ title, subtitle, labels, values, actions, children }: {
    title: string;
    subtitle?: string;
    labels?: string[];
    values?: number[];
    actions?: ReactNode;
    children: ReactNode;
}) {
    const series = labels && values && labels.length === values.length ? labels : [];

    return (
        <Card title={title} subtitle={subtitle} actions={actions}>
            {(!labels || series.length > 1) && children}
            {series.length > 0 && (
                <details className="mt-3 text-sm">
                    <summary>View {title.toLowerCase()} values</summary>
                    <dl className="mt-2 divide-y divide-ink-100">
                        {series.map((label, index) => (
                            <div key={`${index}-${label}`} className="flex justify-between gap-3 py-1">
                                <dt>{label}</dt>
                                <dd>{values?.[index]}</dd>
                            </div>
                        ))}
                    </dl>
                </details>
            )}
            {!series.length && labels && <p className="text-sm text-ink-600">No historical values are available.</p>}
        </Card>
    );
}
