import type { ReactNode } from 'react';

export function RecordHeading({
    area,
    title,
    description,
    actions,
    focusId,
}: {
    area: string;
    title: string;
    description: string;
    actions?: ReactNode;
    focusId?: string;
}) {
    return (
        <header className="flex flex-wrap items-end justify-between gap-4">
            <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-brand-700">{area}</p>
                <h1
                    id={focusId}
                    tabIndex={focusId ? -1 : undefined}
                    className="mt-1 break-words text-[22px] font-semibold tracking-[-0.02em] text-ink-900 sm:text-[26px]"
                >
                    {title}
                </h1>
                <p className="mt-1.5 max-w-3xl text-[13.5px] leading-relaxed text-ink-600">{description}</p>
            </div>
            {actions}
        </header>
    );
}

export function RecordPanel({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
    return (
        <section className="card min-w-0">
            <header className="card-head">
                <div>
                    <h2 className="card-title">{title}</h2>
                    {description && <p className="card-subtitle">{description}</p>}
                </div>
            </header>
            <div className="card-pad grid gap-3">{children}</div>
        </section>
    );
}
