import { Head, Link } from '@inertiajs/react';
import { ReportFilters, type Filters, type Options } from '../../insights/ReportFilters';
import { UsageMeasures } from '../../insights/UsageMeasures';

const names = {
    'institution-usage': 'Institution usage',
    completion: 'Course completion',
    engagement: 'Lesson engagement',
    attendance: 'Class attendance',
    examinations: 'Exam performance',
    activity: 'Academic activity',
};
const descriptions = {
    'institution-usage': 'Current institution-wide populations and recorded activity over the past seven days (UTC, start exclusive and end inclusive). A zero means no matching record; credential acceptances are not a measure of time spent learning.',
    completion:
        'Completed registrations divided by current registrations. The total is weighted by registrations. A dash means there is no denominator.',
    engagement:
        'The share of current registrations with at least one recorded lesson visit in the offering. Repeat visits to the same lesson count once per learner.',
    attendance:
        'Each class shows marked attendance and current registrations without a mark. Unmarked learners are not counted as absent.',
    examinations:
        'Mean points use the latest released score for each registration. A dash means no scores have been released.',
    activity: 'Course activity, enrolments, submissions and released results within your selection.',
};
type Family = keyof typeof names;
type Props = {
    family: Family;
    audience: string;
    filters: Filters;
    options: Options | null;
    columns: string[];
    table: {
        rows: (string | number)[][];
        totals: Record<string, number>;
    };
    limitMessage: string | null;
};

export default function Reports({ family, audience, filters, options, columns, table, limitMessage }: Props) {
    const path = (base: string, selected: Family) => `${base}?${new URLSearchParams({
        ...(selected === 'institution-usage' ? {} : filters), family: selected,
    })}`;
    return (
        <main className="mx-auto max-w-6xl space-y-6 px-5 py-8">
            <Head title="Academic reports" />
            <header>
                <p>{audience}</p>
                <h1 className="text-3xl font-semibold">Academic reports</h1>
            </header>
            <nav aria-label="Report types" className="flex flex-wrap gap-4 border-b pb-3">
                {(Object.keys(names) as Family[]).filter(key => key !== 'institution-usage' || audience === 'Institution').map((key) => (
                    <Link
                        key={key}
                        href={path('/reports', key)}
                        aria-current={key === family ? 'page' : undefined}
                        className={key === family ? 'font-bold' : 'underline'}
                    >
                        {names[key]}
                    </Link>
                ))}
            </nav>
            {options && <ReportFilters
                key={path('/reports', family)}
                path="/reports"
                filters={filters}
                options={options}
                family={family}
            />}
            <section aria-labelledby="report-title" className="space-y-3">
                <h2 id="report-title" className="text-xl font-semibold">
                    {names[family]}
                </h2>
                <p>{descriptions[family]}</p>
                {limitMessage ? (
                    <p role="alert">{limitMessage}</p>
                ) : (
                    <>
                        {Object.keys(table.totals).length > 0 && (
                            <details>
                                <summary className="cursor-pointer">Activity totals</summary>
                                <dl className="grid gap-2 py-3 sm:grid-cols-3">
                                    {Object.entries(table.totals).map(([key, value]) => (
                                        <div key={key}>
                                            <dt>{key}</dt>
                                            <dd className="font-semibold">{value}</dd>
                                        </div>
                                    ))}
                                </dl>
                            </details>
                        )}
                        {family === 'institution-usage' && <UsageMeasures rows={table.rows} />}
                        {table.rows.length ? (
                            <div
                                role="region"
                                aria-label="Report data"
                                tabIndex={0}
                                className={family === 'institution-usage' ? 'hidden overflow-auto sm:block' : 'max-h-[36rem] overflow-auto'}
                            >
                                <table className="w-full text-left">
                                    <caption className="sr-only">{names[family]}</caption>
                                    <thead className="sticky top-0 bg-slate-100">
                                        <tr>
                                            {columns.map((col) => (
                                                <th key={col} scope="col" className={family === 'institution-usage' ? 'whitespace-nowrap p-2' : 'p-2'}>
                                                    {col}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {table.rows.map((row, i) => (
                                            <tr key={i} className="border-b">
                                                {row.map((value, j) => (
                                                    <td key={j} className="p-2">
                                                        {value}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <p>No records match these filters.</p>
                        )}
                        <nav aria-label="Download report" className="flex flex-wrap gap-4">
                            <a className="underline" href={path('/reports/export/pdf', family)}>
                                Download PDF
                            </a>
                            <a className="underline" href={path('/reports/export/xlsx', family)}>
                                Download Excel
                            </a>
                        </nav>
                    </>
                )}
            </section>
        </main>
    );
}
