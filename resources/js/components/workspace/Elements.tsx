import type { ReactNode } from 'react';
import { Icon } from './Icon';

export { Action, Badge, Table } from './Primitives';
export { Icon } from './Icon';
export { Tabs, Drawer } from './Panels';
export { Ring } from './Ring';

type HeadingProps = {
    title: ReactNode;
    eyebrow?: ReactNode;
    description?: ReactNode;
    actions?: ReactNode;
};

export function PageHeader({ eyebrow, title, description, actions }: HeadingProps) {
    return (
        <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <div className="min-w-0">
                {eyebrow && <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-brand-700">{eyebrow}</p>}
                <h1 className="mt-1 text-[22px] font-semibold tracking-[-0.02em] text-ink-900 sm:text-[26px]">{title}</h1>
                {description && <p className="mt-1.5 max-w-3xl text-[13.5px] leading-relaxed text-ink-500">{description}</p>}
            </div>
            {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
        </header>
    );
}

type CardProps = {
    title?: ReactNode;
    subtitle?: ReactNode;
    actions?: ReactNode;
    children: ReactNode;
    bodyClassName?: string;
    className?: string;
};

export function Card({ title, subtitle, actions, children, bodyClassName = 'p-5', className = '' }: CardProps) {
    return (
        <section className={`card min-w-0 ${className}`}>
            {(title || subtitle || actions) && (
                <div className="card-head">
                    <div className="min-w-0 flex-1">
                        {title && <h2 className="card-title">{title}</h2>}
                        {subtitle && <p className="card-subtitle">{subtitle}</p>}
                    </div>
                    {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
                </div>
            )}
            <div className={bodyClassName}>{children}</div>
        </section>
    );
}

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
                    {icon && <span className="rounded-lg bg-ink-50 p-2 text-ink-500"><Icon name={icon} className="h-4 w-4" /></span>}
                </div>
                <p className="kpi-value">{value}</p>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1">
                {delta != null && (
                    <span className={`inline-flex items-center gap-1 whitespace-nowrap text-xs font-semibold ${deltaTone === 'down' ? 'text-rose-600' : 'text-brand-700'}`}>
                        <Icon name="trend" className="h-3.5 w-3.5" />{delta}
                    </span>
                )}
                {deltaLabel && <span className="text-xs text-ink-500">{deltaLabel}</span>}
            </div>
            {children && <div className="mt-3">{children}</div>}
        </article>
    );
}
