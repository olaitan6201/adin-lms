import { Head, Link } from '@inertiajs/react';
import { TeachingFigures, type Activity } from '@/components/workload/TeachingFigures';
import { CourseHeader } from '@/components/learning/CourseHeader';
import { ActivityPeriod } from '@/components/staff/ActivityPeriod';

type Props = {
    staff: {
        id: string;
        staff_number: string;
        name: string;
    };
    from: string;
    until: string;
    rows: Activity[];
};

export default function LecturerActivity({ staff, from, until, rows }: Props) {
    const totals = rows.reduce(
        (sum, r) => ({
            registers: sum.registers + r.registers,
            uploads: sum.uploads + r.uploads,
            marks: sum.marks + r.marks,
        }),
        { registers: 0, uploads: 0, marks: 0 },
    );
    return (
        <main className="course-page">
            <Head title={`${staff.name} · Teaching activity`} />
            <CourseHeader
                eyebrow={`Teaching record · ${staff.staff_number}`}
                title={staff.name}
                description={<p>Teaching activity recorded under this lecturer's account.</p>}
                actions={
                    <Link className="course-action" href="/staff">
                        Lecturer directory
                    </Link>
                }
            />
            <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
                <section className="course-panel course-pad">
                    <h2 className="text-xl font-semibold tracking-tight">Period totals</h2>
                    <p className="text-sm text-muted-foreground">
                        {from} through {until}, inclusive
                    </p>
                    <TeachingFigures row={totals} />
                    <h2 className="text-xl font-semibold tracking-tight mt-8">Activity by offering</h2>
                    {rows.length ? (
                        <ul>
                            {rows.map((r) => (
                                <li className="min-w-0 rounded-lg border p-4 sm:p-6 mt-3" key={r.offering}>
                                    <h3 className="font-semibold">{r.offering}</h3>
                                    <TeachingFigures row={r} />
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="py-4 text-sm text-muted-foreground">
                            No teaching activity was recorded in this period. Choose another date range.
                        </p>
                    )}
                </section>
                <ActivityPeriod staffId={staff.id} from={from} until={until} />
            </div>
        </main>
    );
}
