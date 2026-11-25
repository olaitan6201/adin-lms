import { Head, Link } from '@inertiajs/react';
import { ReportFilters, type Filters, type Options } from '../../insights/ReportFilters';
import { ReportTable, type ReportRow } from '../../insights/ReportTable';

type Props = {
    audience: 'Student' | 'Lecturer' | 'Academic unit' | 'Institution';
    dashboard: boolean;
    filters: Filters;
    options: Options;
    columns: ReportRow;
    table: {
        totals: Record<string, number>;
        rows: ReportRow[];
    };
};

function filteredPath(path: string, filters: Filters) {
    const query = new URLSearchParams(filters).toString();
    return query ? `${path}?${query}` : path;
}

export default function Overview({ audience, dashboard, filters, options, columns, table }: Props) {
    const title = `${audience} ${dashboard ? 'dashboard' : 'report'}`;
    const path = dashboard ? '/dashboard' : '/reports';
    const alternate = filteredPath(dashboard ? '/reports' : '/dashboard', filters);
    const courses = options.offering.filter(course => !filters.offering || course.id === filters.offering);

    return (
        <main className="mx-auto max-w-6xl space-y-8 px-5 py-10 text-slate-900">
            <Head title={title} />
            <header className="border-t-4 border-teal-800 pt-5">
                <Link href="/courses" className="text-teal-800 underline">My courses</Link>
                <h1 className="my-3 text-3xl font-semibold">{title}</h1>
                <p>Academic activity for the courses in your selection.</p>
            </header>
            <ReportFilters key={filteredPath(path, filters)} path={path} filters={filters} options={options} />
            <section aria-labelledby="summary">
                <h2 id="summary" className="mb-3 text-xl font-semibold">Summary</h2>
                <dl className="grid grid-cols-2 gap-px bg-slate-200 sm:grid-cols-3 lg:grid-cols-4">
                    {Object.entries(table.totals).map(([label, value]) => (
                        <div className="bg-slate-50 p-3" key={label}>
                            <dt className="text-sm">{label}</dt>
                            <dd className="text-2xl font-semibold tabular-nums">{value}</dd>
                        </div>
                    ))}
                </dl>
            </section>
            <nav aria-label="Report actions" className="flex flex-wrap gap-5 text-teal-800 underline">
                <Link href={alternate}>{dashboard ? 'Open filtered report' : 'View dashboard'}</Link>
                <a href={filteredPath('/reports/export/pdf', filters)}>Download PDF</a>
                <a href={filteredPath('/reports/export/xlsx', filters)}>Download Excel</a>
            </nav>
            {dashboard && courses.length > 0 && (
                <section aria-labelledby="drilldown">
                    <h2 id="drilldown" className="mb-2 text-xl font-semibold">Course reports</h2>
                    <ul className="flex flex-wrap gap-4">
                        {courses.map(course => (
                            <li key={course.id}>
                                <Link className="text-teal-800 underline" href={filteredPath('/reports', { ...filters, offering: course.id })}>
                                    {course.label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </section>
            )}
            <ReportTable columns={columns} rows={table.rows} />
        </main>
    );
}
