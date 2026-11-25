import { PortalField } from '../components/PortalForm';
import { FormFeedback } from '@/components/FormFeedback';
import { Button } from '@/components/ui/button';
import { Form, Head, Link } from '@inertiajs/react';
import { TeachingFigures, type Activity } from '../components/workload/TeachingFigures';

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
        <main className="mx-auto w-full min-w-0 max-w-6xl space-y-6 wrap-anywhere px-4 py-6 sm:px-6 lg:px-8">
            <Head title={`${staff.name} · Teaching activity`} />
            <Link className="font-medium text-primary underline underline-offset-4" href="/staff">
                Lecturer directory
            </Link>
            <header className="min-w-0 space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Teaching record · {staff.staff_number}</p>
                <h1 className="break-words text-3xl font-semibold tracking-tight">{staff.name}</h1>
                <p>Teaching activity recorded under this lecturer's account.</p>
            </header>
            <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
                <section>
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
                <aside className="min-w-0 space-y-3 rounded-lg border bg-card p-4 text-card-foreground sm:p-6">
                    <h2 className="text-xl font-semibold tracking-tight">Reporting period</h2>
                    <Form method="get" action={`/staff/${staff.id}/activity`} className="mt-4 grid gap-3">
                        {({ errors, processing }) => (
                            <FormFeedback errors={errors}>
                                <PortalField label="From" type="date" name="from" defaultValue={from} required error={errors.from} announceError={false} />
                                <PortalField label="Through" type="date" name="until" defaultValue={until} required error={errors.until} announceError={false} />
                                <Button disabled={processing}>
                                    Apply dates
                                </Button>
                            </FormFeedback>
                        )}
                    </Form>
                </aside>
            </div>
        </main>
    );
}
