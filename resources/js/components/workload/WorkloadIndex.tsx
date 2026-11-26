import { Head } from '@inertiajs/react';
import { PerformanceNote, Totals } from './ClassMetrics';
import { TermSelector } from './TermSelector';
import type { WorkloadData } from './contracts';
import { CourseHeader } from '@/components/learning/CourseHeader';
import { AllocatedClass } from '@/components/workload/AllocatedClass';

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
                    <p className="mt-4 border-y py-4 text-muted-foreground">No teaching allocations are linked to this term.</p>
                ) : (
                    <ul className="mt-4 grid gap-4">
                        {workload.classes.map((course) => (
                            <AllocatedClass key={course.id} course={course} />
                        ))}
                    </ul>
                )}
            </section>
        </main>
    );
}
