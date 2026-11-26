import { type ReactNode } from 'react';
import { Icon } from '@/components/icons/Icon';

export { Icon as StudyIcon };

export function StudyMetric({ label, value, hint }: { label: string; value: string; hint: string }) {
    return (
        <article className="kpi">
            <div>
                <p className="kpi-label">{label}</p>
                <p className="kpi-value">{value}</p>
            </div>
            <p className="text-xs text-ink-400">{hint}</p>
        </article>
    );
}

export function Note({ children, tone }: { children: ReactNode; tone: string }) {
    const warning = tone === 'amber';
    return (
        <aside
            className={`flex items-start gap-2.5 rounded-xl border px-3.5 py-3 text-[13px] leading-relaxed ${warning ? 'learning-note-warning border-amber-200 text-amber-900' : 'learning-note-info border-sky-200 text-sky-900'}`}
        >
            <Icon name={warning ? 'alert' : 'info'} className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{children}</span>
        </aside>
    );
}

type MeterProps = { value: number; label?: string; showValue?: boolean; tone?: string };

export function Meter({ value, label, showValue, tone }: MeterProps) {
    const color = tone === 'sky' ? 'bg-sky-500' : tone === 'amber' ? 'bg-amber-500' : 'bg-brand-500';
    return (
        <div className="space-y-1.5">
            {(label || showValue) && (
                <div className="flex items-center justify-between gap-3">
                    {label && <span className="text-xs font-medium text-ink-500">{label}</span>}
                    {showValue && <span className="tnum text-xs font-semibold text-ink-700">{value}%</span>}
                </div>
            )}
            <div
                className="prog-track"
                role="meter"
                aria-label={label ?? 'Progress'}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={value}
            >
                <div className={`prog-fill ${color}`} style={{ width: `${value}%` }} />
            </div>
        </div>
    );
}

export function Timeline({ items }: { items: { title: string; meta: string; body: string }[] }) {
    return (
        <ol className="relative space-y-5 border-l border-ink-100 pl-5">
            {items.map(({ title, meta, body }) => (
                <li className="relative" key={title}>
                    <span className="absolute -left-[26px] top-1 h-3 w-3 rounded-full border-2 border-white bg-brand-500" />
                    <p className="text-[13px] font-semibold text-ink-800">{title}</p>
                    <p className="mt-0.5 text-xs text-ink-500">{meta}</p>
                    <p className="mt-1 text-[13px] leading-relaxed text-ink-600">{body}</p>
                </li>
            ))}
        </ol>
    );
}
