import { Button } from '@/components/ui/button';
import { Link } from '@inertiajs/react';
import { CourseMeta, Totals } from './ClassMetrics';
import type { WorkloadClass } from './contracts';

export function AllocatedClass({ course }: { course: WorkloadClass }) {
    return (
        <li className="course-panel course-pad space-y-3">
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
    );
}
