import { Head, Link } from '@inertiajs/react';
import { CourseMeta, PerformanceNote, Totals } from './ClassMetrics';
import type { ClassReport } from './contracts';

export function ClassReportView({ report }: { report: ClassReport }) {
    return (
        <main className="min-h-screen bg-slate-50 text-slate-900">
            <Head title={`${report.class.code} class report`} />
            <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
                <Link
                    href="/workload"
                    className="inline-flex min-h-11 items-center font-semibold text-teal-800 underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-800"
                >
                    Back to teaching workload
                </Link>
                <header className="mt-4">
                    <p className="text-sm font-semibold uppercase tracking-wide text-teal-800">
                        Class report
                    </p>
                    <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
                        {report.class.code} — {report.class.title}
                    </h1>
                    <CourseMeta course={report.class} />
                </header>

                <section
                    aria-labelledby="allocation-heading"
                    className="mt-8 rounded-xl border border-slate-200 bg-white p-5"
                >
                    <h2 id="allocation-heading" className="text-xl font-semibold text-slate-950">
                        Current allocation
                    </h2>
                    <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
                        <div>
                            <dt className="text-slate-500">Allocated lecturer</dt>
                            <dd className="mt-1 font-medium text-slate-900">
                                {report.allocation.lecturer}
                            </dd>
                        </div>
                        <div>
                            <dt className="text-slate-500">Staff number</dt>
                            <dd className="mt-1 font-medium text-slate-900">
                                {report.allocation.staff_number}
                            </dd>
                        </div>
                    </dl>
                    <p className="mt-4 text-sm text-slate-600">
                        Direct report access requires both this allocation and an authorised role
                        scope.
                    </p>
                </section>

                <section aria-labelledby="performance-heading" className="mt-8">
                    <h2 id="performance-heading" className="text-xl font-semibold text-slate-950">
                        Enrolment and performance
                    </h2>
                    <div className="mt-4">
                        <Totals totals={report.totals} />
                    </div>
                    <PerformanceNote />
                </section>
            </div>
        </main>
    );
}
