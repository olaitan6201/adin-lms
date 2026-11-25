import { Button } from '@/components/ui/button';
import { Head, Link } from '@inertiajs/react';
import { CourseMeta, PerformanceNote, Totals } from './ClassMetrics';
import { TermSelector } from './TermSelector';
import type { WorkloadData } from './contracts';

export function WorkloadIndex({ workload }: { workload: WorkloadData }) {
    return (
        <main className="mx-auto w-full min-w-0 max-w-6xl space-y-6 wrap-anywhere px-4 py-6 sm:px-6 lg:px-8">
            <Head title="Teaching workload" />
            <div>
                <header className="min-w-0 space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">Lecturer workspace</p>
                    <h1 className="break-words text-3xl font-semibold tracking-tight">Teaching workload</h1>
                    <p className="mt-2 text-muted-foreground">
                        Review allocated classes, enrolments and released performance by term.
                    </p>
                </header>

                <TermSelector workload={workload} />

                <section aria-labelledby="classes-heading" className="mt-8">
                    <div className="flex items-baseline justify-between gap-4">
                        <h2 id="classes-heading" className="text-xl font-semibold text-foreground">
                            Allocated classes
                        </h2>
                        <span className="text-sm text-muted-foreground">{workload.totals.classes} total</span>
                    </div>
                    {workload.classes.length === 0 ? (
                        <p className="mt-4 border-y py-4 text-muted-foreground">
                            No teaching allocations are linked to this term.
                        </p>
                    ) : (
                        <ul className="mt-4 grid gap-4">
                            {workload.classes.map((course) => (
                                <li key={course.id} className="min-w-0 space-y-3 rounded-lg border bg-card p-4 text-card-foreground sm:p-6">
                                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                        <div>
                                            <p className="text-sm font-semibold text-primary">{course.code}</p>
                                            <h3 className="mt-1 text-lg font-semibold text-foreground">
                                                {course.title}
                                            </h3>
                                        </div>
                                        <Button asChild variant="outline">
                                            <Link href={course.report_url} aria-label={`Open class report for ${course.code}`}>
                                                Open report
                                            </Link>
                                        </Button>
                                    </div>
                                    <CourseMeta course={course} />
                                    <div className="mt-5">
                                        <Totals totals={course.totals} />
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>
                <section aria-labelledby="summary-heading" className="mt-8 space-y-3">
                    <h2 id="summary-heading" className="text-xl font-semibold">Workload summary</h2>
                    <Totals totals={workload.totals} />
                    <PerformanceNote />
                </section>
            </div>
        </main>
    );
}
