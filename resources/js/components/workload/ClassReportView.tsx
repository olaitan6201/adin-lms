import { Head, Link } from '@inertiajs/react';
import { CourseMeta, PerformanceNote, Totals } from './ClassMetrics';
import type { ClassReport } from './contracts';
import { TeachingFigures } from './TeachingFigures';

export function ClassReportView({ report }: { report: ClassReport }) {
    return (
        <main className="portal-page">
            <Head title={`${report.class.code} class report`} />
            <div>
                <Link
                    href="/workload"
                    className="inline-flex min-h-11 items-center font-semibold text-teal-800 underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-800"
                >
                    Back to teaching workload
                </Link>
                <header className="desk-heading mt-4">
                    <p className="portal-kicker">
                        Class report
                    </p>
                    <h1 className="portal-title">
                        {report.class.code} — {report.class.title}
                    </h1>
                    <CourseMeta course={report.class} />
                </header>

                <section
                    aria-labelledby="allocation-heading"
                    className="portal-panel desk-shelf mt-8"
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

                <section className="mt-8"><h2 className="desk-section">My teaching activity this month</h2>
                    <TeachingFigures row={report.activity ?? { registers: 0, uploads: 0, marks: 0 }} />
                    <Link className="desk-link" href={`/courses/${report.class.id}`}>Open course workspace</Link>
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
                <section className="portal-panel desk-shelf mt-8"><h2 className="desk-section">Study group progress</h2>
                    <p className="desk-note">Completed lessons across current members of each group.</p>
                    {report.groups.length ? <ul>{report.groups.map(group => <li key={group.id} className="py-3">
                        <strong>{group.name}</strong><p>{group.members} current members · {group.lessons} lesson completions</p>
                    </li>)}</ul> : <p className="desk-empty">There are no study groups in this offering.</p>}
                    <Link className="desk-link" href={`/community/courses/${report.class.id}`}>Open course groups</Link>
                </section>
            </div>
        </main>
    );
}
