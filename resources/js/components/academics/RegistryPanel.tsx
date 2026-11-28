import type { ReactNode } from 'react';

export function RegistryPanel({
    title,
    subtitle,
    children,
    actions,
    id,
}: {
    title: string;
    subtitle?: string;
    children: ReactNode;
    actions?: ReactNode;
    id?: string;
}) {
    return (
        <section id={id} className="card min-w-0 scroll-mt-20" tabIndex={id ? -1 : undefined}>
            <div className="card-head">
                <div className="min-w-0 flex-1">
                    <h2 className="card-title">{title}</h2>
                    {subtitle && <p className="card-subtitle">{subtitle}</p>}
                </div>
                {actions}
            </div>
            <div className="min-w-0 space-y-3 p-5">{children}</div>
        </section>
    );
}

export function RegistryFigures({ values }: { values: Record<string, number> }) {
    return (
        <dl className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {Object.entries(values).map(([label, value]) => (
                <div key={label} className="kpi">
                    <dt className="kpi-label">{label}</dt>
                    <dd className="kpi-value">{value.toLocaleString()}</dd>
                </div>
            ))}
        </dl>
    );
}

export function RegistryTable({
    columns,
    title,
    children,
    grouped = false,
}: {
    columns: string[];
    title: string;
    children: ReactNode;
    grouped?: boolean;
}) {
    return (
        <div
            className="overflow-x-auto"
            tabIndex={0}
            role="region"
            aria-label={title}
        >
            <table
                className={
                    grouped
                        ? 'tbl max-sm:block max-sm:[&_thead]:sr-only max-sm:[&_tbody]:block max-sm:[&_tbody]:border-t max-sm:[&_tbody]:border-ink-100 max-sm:[&_tbody_tr:not([data-state=closed])]:block max-sm:[&_td]:inline-block max-sm:[&_td]:border-0 max-sm:[&_td]:px-1 max-sm:[&_td]:py-1.5 max-sm:[&_td:first-child]:block max-sm:[&_td[colspan]]:w-full'
                        : 'tbl'
                }
            >
                <caption className="sr-only">{title}</caption>
                <thead>
                    <tr>
                        {columns.map((col) => (
                            <th key={col} scope="col">
                                {col}
                            </th>
                        ))}
                    </tr>
                </thead>
                {grouped ? children : <tbody>{children}</tbody>}
            </table>
        </div>
    );
}
