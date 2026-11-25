import { Head, Link } from '@inertiajs/react';
import { CourseMeta, PerformanceNote, Totals } from './ClassMetrics';
import type { ClassReport } from './contracts';
import { TeachingFigures } from './TeachingFigures';

export function ClassReportView({ report }: { report: ClassReport }) {
    return (
        <main className="mx-auto w-full min-w-0 max-w-6xl space-y-6 wrap-anywhere px-4 py-6 sm:px-6 lg:px-8">
            <Head title={`${report.class.code} class report`} />
            <div>
                <Link
                    href="/workload"
                    className="font-medium text-primary underline underline-offset-4"
                >
                    Back to teaching workload
                </Link>
                <header className="min-w-0 space-y-2 mt-4">
                    <p className="text-sm font-medium text-muted-foreground">Class report</p>
                    <h1 className="break-words text-3xl font-semibold tracking-tight">
                        {report.class.code} — {report.class.title}
                    </h1>
                    <CourseMeta course={report.class} />
                </header>

                <section aria-labelledby="allocation-heading" className="min-w-0 space-y-3 rounded-lg border bg-card p-4 text-card-foreground sm:p-6 mt-8">
                    <h2 id="allocation-heading" className="text-xl font-semibold text-foreground">
                        Current allocation
                    </h2>
                    <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
                        <div>
                            <dt className="text-muted-foreground">Allocated lecturer</dt>
                            <dd className="mt-1 font-medium text-foreground">{report.allocation.lecturer}</dd>
                        </div>
                        <div>
                            <dt className="text-muted-foreground">Staff number</dt>
                            <dd className="mt-1 font-medium text-foreground">{report.allocation.staff_number}</dd>
                        </div>
                    </dl>
                    <p className="mt-4 text-sm text-muted-foreground">
                        Direct report access requires both this allocation and an authorised role scope.
                    </p>
                </section>

                <section className="mt-8">
                    <h2 className="text-xl font-semibold tracking-tight">My teaching activity this month</h2>
                    <TeachingFigures row={report.activity ?? { registers: 0, uploads: 0, marks: 0 }} />
                    <Link className="font-medium text-primary underline underline-offset-4" href={`/courses/${report.class.id}`}>
                        Open course workspace
                    </Link>
                </section>
                <section aria-labelledby="performance-heading" className="mt-8">
                    <h2 id="performance-heading" className="text-xl font-semibold text-foreground">
                        Enrolment and performance
                    </h2>
                    <div className="mt-4">
                        <Totals totals={report.totals} />
                    </div>
                    <PerformanceNote />
                </section>
                <section className="min-w-0 space-y-3 rounded-lg border bg-card p-4 text-card-foreground sm:p-6 mt-8">
                    <h2 className="text-xl font-semibold tracking-tight">Study group progress</h2>
                    <p className="text-sm text-muted-foreground">Completed lessons across current members of each group.</p>
                    {report.groups.length ? (
                        <ul>
                            {report.groups.map((group) => (
                                <li key={group.id} className="py-3">
                                    <strong>{group.name}</strong>
                                    <p>
                                        {group.members} current members · {group.lessons} lesson completions
                                    </p>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="py-4 text-sm text-muted-foreground">There are no study groups in this offering.</p>
                    )}
                    <Link className="font-medium text-primary underline underline-offset-4" href={`/community/courses/${report.class.id}`}>
                        Open course groups
                    </Link>
                </section>
            </div>
        </main>
    );
}
