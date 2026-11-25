import { ReportTable } from '../../insights/ReportTable';
import { Button } from '@/components/ui/button';
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
    reportScope: string | null;
    canViewInstitutionUsage: boolean;
    filters: Filters;
    options: Options | null;
    columns: string[];
    table: {
        rows: (string | number)[][];
        totals: Record<string, number>;
    };
    limitMessage: string | null;
};

export default function Reports({ family, audience, reportScope, canViewInstitutionUsage, filters, options, columns, table, limitMessage }: Props) {
    const path = (base: string, selected: Family) => `${base}?${new URLSearchParams({
        ...(selected === 'institution-usage' ? {} : filters), family: selected,
    })}`;
    const active = Object.keys(filters).length;
    const count = table.rows.length;
    // Completion always includes a totals row, even when no offering matches.
    const hasRecords = family === 'completion' ? count > 1 : count > 0;
    const summary = !reportScope ? 'No reporting scope assigned.'
        : limitMessage || (hasRecords ? `${count} report ${count === 1 ? 'row' : 'rows'}`
            : active ? 'No records match these filters.' : 'No records for this report yet.');
    return (
        <main className="portal-page min-w-0 space-y-4">
            <Head title="Academic reports" />
            <header className="border-b border-[var(--portal-line)] pb-4">
                <p className="portal-kicker">{audience} · Academic reports</p>
                <h1 id="report-title" tabIndex={-1} className="portal-title">{names[family]}</h1>
                {reportScope && <p>Scope: {reportScope}</p>}
                <p className="font-semibold" role={limitMessage ? 'alert' : 'status'}>{summary}</p>
                {!reportScope && <p>Contact your academic office if you expected access to course reports.</p>}
                {active > 0 && <Link className="inline-block py-1 underline" href={`/reports?family=${family}`}>
                    Clear {active} applied {active === 1 ? 'filter' : 'filters'}
                </Link>}
            </header>
            <details key={family} className="border-b border-[var(--portal-line)]">
                <summary className="cursor-pointer py-3 font-semibold">Change report type</summary>
                <nav aria-label="Report types" className="flex flex-wrap gap-x-4 pb-3">
                    {(Object.keys(names) as Family[]).filter(key => key !== 'institution-usage' || canViewInstitutionUsage).map((key) => (
                        <Link
                            key={key}
                            href={path('/reports', key)}
                            aria-current={key === family ? 'page' : undefined}
                            className={`py-2 ${key === family ? 'font-bold' : 'underline'}`}
                        >
                            {names[key]}
                        </Link>
                    ))}
                </nav>
            </details>
            {options && reportScope && <ReportFilters
                key={path('/reports', family)}
                path="/reports"
                filters={filters}
                options={options}
                family={family}
            />}
            <section aria-labelledby="report-title" className="space-y-3">
                {reportScope && <p>{descriptions[family]}</p>}
                {!limitMessage && reportScope && (
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
                        {family !== 'institution-usage' && count > 0 && (
                            <p id="scroll-hint" className="desk-note sm:hidden">Scroll the table sideways to see every column.</p>
                        )}
                        {table.rows.length > 0 && (
                            <ReportTable title={names[family]} columns={columns} rows={table.rows}
                                usage={family === 'institution-usage'} />
                        )}
                    </>
                )}
                {!limitMessage && <nav aria-label="Download report" className="flex flex-wrap gap-4">
                    <Button asChild variant="outline">
                        <a href={path('/reports/export/pdf', family)}>
                            Download PDF
                        </a>
                    </Button>
                    <Button asChild variant="outline">
                        <a href={path('/reports/export/xlsx', family)}>
                            Download Excel
                        </a>
                    </Button>
                </nav>}
            </section>
        </main>
    );
}
