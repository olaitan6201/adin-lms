import { Head, Link } from '@inertiajs/react';
import { CourseMeta, PerformanceNote, Totals } from './ClassMetrics';
import type { ClassReport } from './contracts';
import { TeachingFigures } from './TeachingFigures';
import { CourseHeader } from '@/components/learning/CourseHeader';
import { StudyGroupProgress } from '@/components/workload/StudyGroupProgress';

export function ClassReportView({ report }: { report: ClassReport }) {
    return (
        <main className="course-page">
            <Head title={`${report.class.code} class report`} />
            <CourseHeader
                eyebrow="Lecturer workspace · Class report"
                title={`${report.class.code} — ${report.class.title}`}
                actions={
                    <Link href="/workload" className="course-action">
                        Back to teaching workload
                    </Link>
                }
            />

            <section aria-labelledby="allocation-heading" className="course-panel course-pad space-y-3">
                <h2 id="allocation-heading" className="text-xl font-semibold text-foreground">
                    Current allocation
                </h2>
                <CourseMeta course={report.class} />
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

            <section className="course-panel course-pad">
                <h2 className="text-xl font-semibold tracking-tight">My teaching activity this month</h2>
                <TeachingFigures row={report.activity ?? { registers: 0, uploads: 0, marks: 0 }} />
                <Link className="font-medium text-primary underline underline-offset-4" href={`/courses/${report.class.id}`}>
                    Open course workspace
                </Link>
            </section>
            <section aria-labelledby="performance-heading" className="course-panel course-pad">
                <h2 id="performance-heading" className="text-xl font-semibold text-foreground">
                    Enrolment and performance
                </h2>
                <div className="mt-4">
                    <Totals totals={report.totals} />
                </div>
                <PerformanceNote />
            </section>
            <StudyGroupProgress groups={report.groups} offeringId={report.class.id} />
        </main>
    );
}
