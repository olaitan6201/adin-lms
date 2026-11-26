import type { ReactNode } from 'react';

const tones = new Map([
    ['emerald', 'bg-brand-50 text-brand-700 ring-brand-200'],
    ['slate', 'bg-ink-50 text-ink-600 ring-ink-200'],
    ['amber', 'bg-amber-50 text-amber-700 ring-amber-200'],
    ['rose', 'bg-rose-50 text-rose-700 ring-rose-200'],
    ['sky', 'bg-sky-50 text-sky-700 ring-sky-200'],
]);

export function Badge({ children, tone = 'slate' }: {
    children: ReactNode;
    tone?: string
}) {
    return <span className={`badge ring-1 ring-inset ${tones.get(tone) ?? tones.get('slate')}`}>{children}</span>;
}
