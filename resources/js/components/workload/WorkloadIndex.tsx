import { Head, Link } from '@inertiajs/react';
import { CourseMeta, PerformanceNote, Totals } from './ClassMetrics';
import { TermSelector } from './TermSelector';
import type { WorkloadData } from './contracts';

export function WorkloadIndex({ workload }: { workload: WorkloadData }) {
    return (
        <main className="portal-page">
            <Head title="Teaching workload" />
            <div>
                <header className="desk-heading">
                    <p className="portal-kicker">
                        Lecturer workspace
                    </p>
                    <h1 className="portal-title">
                        Teaching workload
                    </h1>
                    <p className="mt-2 text-slate-600">
                        Review allocated classes, enrolments and released performance by term.
                    </p>
                </header>

                <TermSelector workload={workload} />

                <section aria-labelledby="summary-heading" className="mt-8">
                    <h2 id="summary-heading" className="sr-only">
                        Workload summary
                    </h2>
                    <Totals totals={workload.totals} />
                </section>

                <section aria-labelledby="classes-heading" className="mt-8">
                    <div className="flex items-baseline justify-between gap-4">
                        <h2 id="classes-heading" className="text-xl font-semibold text-slate-950">
                            Allocated classes
                        </h2>
                        <span className="text-sm text-slate-600">
                            {workload.totals.classes} total
                        </span>
                    </div>
                    {workload.classes.length === 0 ? (
                        <p className="mt-4 rounded-xl border border-dashed border-slate-300 bg-white p-6 text-slate-600">
                            No teaching allocations are linked to this term.
                        </p>
                    ) : (
                        <ul className="mt-4 grid gap-4">
                            {workload.classes.map((course) => (
                                <li
                                    key={course.id}
                                    className="portal-panel desk-shelf"
                                >
                                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                        <div>
                                            <p className="text-sm font-semibold text-teal-800">
                                                {course.code}
                                            </p>
                                            <h3 className="mt-1 text-lg font-semibold text-slate-950">
                                                {course.title}
                                            </h3>
                                        </div>
                                        <Link
                                            href={course.report_url}
                                            aria-label={`Open class report for ${course.code}`}
                                            className="inline-flex min-h-11 shrink-0 items-center rounded-md border border-slate-300 px-4 font-semibold text-slate-800 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-800"
                                        >
                                            Open report
                                        </Link>
                                    </div>
                                    <CourseMeta course={course} />
                                    <div className="mt-5">
                                        <Totals totals={course.totals} />
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                    <PerformanceNote />
                </section>
            </div>
        </main>
    );
}
