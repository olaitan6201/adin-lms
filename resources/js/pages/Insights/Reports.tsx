import { Disclosure } from '@/components/ui/controls/Disclosure';
import { Head, Link } from '@inertiajs/react';
import { ReportFilters } from '@/components/reports/ReportFilters';
import { names, reportSummary, type Family, type ReportProps } from '@/components/insights/reportFamilies';
import { ReportResults } from '@/components/insights/ReportResults';

export default function Reports({
    family,
    audience,
    reportScope,
    canViewInstitutionUsage,
    filters,
    options,
    columns,
    table,
    limitMessage,
}: ReportProps) {
    const path = (base: string, selected: Family) =>
        `${base}?${new URLSearchParams({
            ...(selected === 'institution-usage' ? {} : filters),
            family: selected,
        })}`;
    const active = Object.keys(filters).length;
    const summary = reportSummary(family, reportScope, limitMessage, table.rows.length, active);
    return (
        <main className="w-full min-w-0 space-y-5">
            <Head title="Academic reports" />
            <header className="mb-6 space-y-1">
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-brand-700">{audience} · Academic reports</p>
                <h1 id="report-title" tabIndex={-1} className="text-[22px] font-semibold tracking-[-0.02em] text-ink-900 sm:text-[26px]">
                    {names[family]}
                </h1>
                {reportScope && <p className="text-sm text-ink-600">Scope: {reportScope}</p>}
                <p className="text-sm font-semibold" role={limitMessage ? 'alert' : 'status'}>
                    {summary}
                </p>
                {!reportScope && <p>Contact your academic office if you expected access to course reports.</p>}
                {active > 0 && (
                    <Link className="inline-block py-1 underline" href={`/reports?family=${family}`}>
                        Clear {active} applied {active === 1 ? 'filter' : 'filters'}
                    </Link>
                )}
            </header>
            <div className="card space-y-3 p-4">
                <Disclosure key={family} label="Change report type">
                    <nav aria-label="Report types" className="flex flex-wrap gap-1 border-b border-ink-100">
                        {(Object.keys(names) as Family[])
                            .filter((key) => key !== 'institution-usage' || canViewInstitutionUsage)
                            .map((key) => (
                                <Link
                                    key={key}
                                    href={path('/reports', key)}
                                    aria-current={key === family ? 'page' : undefined}
                                    className={`border-b-2 px-3.5 py-2.5 text-sm font-medium ${key === family ? 'border-brand-600 text-brand-800' : 'border-transparent text-ink-600 hover:text-ink-900'}`}
                                >
                                    {names[key]}
                                </Link>
                            ))}
                    </nav>
                </Disclosure>
                {options && reportScope && (
                    <ReportFilters key={path('/reports', family)} path="/reports" filters={filters} options={options} family={family} />
                )}
            </div>
            <ReportResults
                family={family}
                reportScope={reportScope}
                limitMessage={limitMessage}
                columns={columns}
                table={table}
                path={path}
            />
        </main>
    );
}
