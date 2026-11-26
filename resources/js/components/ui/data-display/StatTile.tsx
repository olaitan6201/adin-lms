import type { ReactNode } from 'react';
import { Icon } from '@/components/icons/Icon';

type StatProps = {
    label: ReactNode;
    value: ReactNode;
    delta?: ReactNode;
    deltaLabel?: ReactNode;
    deltaTone?: 'up' | 'down';
    icon?: string;
    children?: ReactNode;
};

export function StatTile({ label, value, delta, deltaLabel, deltaTone, icon, children }: StatProps) {
    return (
        <article className="kpi">
            <div>
                <div className="flex items-start justify-between gap-3">
                    <p className="kpi-label">{label}</p>
                    {icon && (
                        <span className="rounded-lg bg-ink-50 p-2 text-ink-500">
                            <Icon name={icon} className="h-4 w-4" />
                        </span>
                    )}
                </div>
                <p className="kpi-value">{value}</p>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1">
                {delta != null && (
                    <span
                        className={`inline-flex items-center gap-1 whitespace-nowrap text-xs font-semibold ${deltaTone === 'down' ? 'text-rose-600' : 'text-brand-700'}`}
                    >
                        <Icon name="trend" className="h-3.5 w-3.5" />
                        {delta}
                    </span>
                )}
                {deltaLabel && <span className="text-xs text-ink-500">{deltaLabel}</span>}
            </div>
            {children && <div className="mt-3">{children}</div>}
        </article>
    );
}
