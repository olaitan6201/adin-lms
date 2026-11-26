import { Button } from '@/components/ui/button';
import { Head, Link } from '@inertiajs/react';
import { CourseMeta, PerformanceNote, Totals } from './ClassMetrics';
import { TermSelector } from './TermSelector';
import type { WorkloadData } from './contracts';
import { CourseHeader } from '@/pages/Learning/CourseHeader';

export function WorkloadIndex({ workload }: { workload: WorkloadData }) {
    return (
        <main className="course-page">
            <Head title="Teaching workload" />
            <CourseHeader
                eyebrow="Lecturer workspace"
                title="Teaching workload"
                description={<p>Review allocated classes, enrolments and released performance by term.</p>}
            />

            <TermSelector workload={workload} />
            <section aria-labelledby="summary-heading" className="course-panel course-pad space-y-3">
                <h2 id="summary-heading">Workload summary</h2>
                <Totals totals={workload.totals} />
                <PerformanceNote />
            </section>

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
                            <li key={course.id} className="course-panel course-pad space-y-3">
                                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                    <div>
                                        <p className="text-sm font-semibold text-primary">{course.code}</p>
                                        <h3 className="mt-1 text-lg font-semibold text-foreground">{course.title}</h3>
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
        </main>
    );
}
