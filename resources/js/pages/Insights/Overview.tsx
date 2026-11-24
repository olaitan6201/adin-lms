import { Head, Link, router } from '@inertiajs/react';
import type { FormEvent } from 'react';

type Filter = 'session' | 'term' | 'offering';
type Props = {
    audience: string;
    dashboard: boolean;
    filters: Partial<Record<Filter, string>>;
    options: Record<Filter, { id: string; label: string }[]>;
    columns: string[];
    table: { totals: Record<string, number>; rows: string[][] };
};
const names = { session: 'Academic session', term: 'Semester', offering: 'Course offering' };

export default function Overview({ audience, dashboard, filters, options, columns, table }: Props) {
    const title = `${audience} ${dashboard ? 'dashboard' : 'report'}`;
    const path = dashboard ? '/dashboard' : '/reports';
    const query = new URLSearchParams(filters).toString();
    const suffix = query ? `?${query}` : '';
    function apply(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        const selected = Object.fromEntries(Array.from(data.entries()).filter(([, value]) => value !== '').map(([key, value]) => [key, String(value)]));
        router.get(path, selected);
    }

    return (
        <main className="mx-auto max-w-6xl space-y-8 px-5 py-10 text-slate-900">
            <Head title={title} />
            <header className="border-t-4 border-teal-800 pt-5">
                <Link href="/courses" className="text-teal-800 underline">My courses</Link>
                <h1 className="my-3 text-3xl font-semibold">{title}</h1>
                <p>Academic activity for the courses in your selection.</p>
            </header>
            <form key={query} onSubmit={apply} className="flex flex-wrap items-end gap-4 rounded border border-slate-300 p-4">
                {(Object.keys(names) as Filter[]).map(key => <label key={key} className="grid min-w-0 gap-1 font-medium">
                    {names[key]}
                    <select name={key} defaultValue={filters[key] ?? ''} className="max-w-full rounded border border-slate-500 bg-white p-2">
                        <option value="">All {key === 'offering' ? 'courses' : key === 'term' ? 'semesters' : 'sessions'}</option>
                        {filters[key] && !options[key].some(item => item.id === filters[key]) &&
                            <option value={filters[key]}>No matching records</option>}
                        {options[key].map(item => <option value={item.id} key={item.id}>{item.label}</option>)}
                    </select>
                </label>)}
                <button className="rounded bg-teal-800 px-4 py-2 text-white">Apply filters</button>
                <Link href={path} className="py-2 underline">Clear filters</Link>
            </form>
            <section aria-labelledby="summary">
                <h2 id="summary" className="mb-3 text-xl font-semibold">Summary</h2>
                <dl className="grid grid-cols-2 gap-px bg-slate-200 sm:grid-cols-3 lg:grid-cols-4">
                    {Object.entries(table.totals).map(([label, value]) => <div className="bg-slate-50 p-3" key={label}>
                        <dt className="text-sm">{label}</dt><dd className="text-2xl font-semibold tabular-nums">{value}</dd>
                    </div>)}
                </dl>
            </section>
            <nav aria-label="Report actions" className="flex flex-wrap gap-5 text-teal-800 underline">
                <Link href={`${dashboard ? '/reports' : '/dashboard'}${suffix}`}>{dashboard ? 'Open filtered report' : 'View dashboard'}</Link>
                <a href={`/reports/export/pdf${suffix}`}>Download PDF</a>
                <a href={`/reports/export/xlsx${suffix}`}>Download Excel</a>
            </nav>
            {dashboard && options.offering.length > 0 && <section aria-labelledby="drilldown">
                <h2 id="drilldown" className="mb-2 text-xl font-semibold">Course reports</h2>
                <ul className="flex flex-wrap gap-4">{options.offering.filter(c => !filters.offering || c.id === filters.offering)
                    .map(c => <li key={c.id}><Link className="text-teal-800 underline"
                        href={`/reports?${new URLSearchParams({ ...filters, offering: c.id })}`}>{c.label}</Link></li>)}</ul>
            </section>}
            {table.rows.length === 0 ? <p>No records match this selection.</p> :
                <div className="overflow-x-auto" tabIndex={0} role="region" aria-label="Academic activity details">
                    <table className="w-full text-left text-sm">
                        <caption className="pb-3 text-left text-xl font-semibold">Academic activity details</caption>
                        <thead className="border-y border-slate-300 bg-slate-50"><tr>
                            {columns.map(c => <th scope="col" className="p-3" key={c}>{c}</th>)}
                        </tr></thead>
                        <tbody>{table.rows.map((row, index) => <tr key={index} className="border-b border-slate-200">
                            {row.map((cell, i) => <td key={i} className="p-3 align-top break-words">{cell}</td>)}
                        </tr>)}</tbody>
                    </table>
                </div>}
        </main>
    );
}
