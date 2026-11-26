import type { ReactNode } from 'react';

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
