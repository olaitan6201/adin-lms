import { Input } from '@/components/ui/input';
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
        <main className="portal-page">
            <Head title={`${staff.name} · Teaching activity`} />
            <Link className="desk-link" href="/staff">
                Lecturer directory
            </Link>
            <header className="desk-heading">
                <p className="portal-kicker">Teaching record · {staff.staff_number}</p>
                <h1 className="portal-title">{staff.name}</h1>
                <p>Teaching activity recorded under this lecturer's account.</p>
            </header>
            <div className="desk-grid">
                <section>
                    <h2 className="desk-section">Period totals</h2>
                    <p className="desk-note">
                        {from} through {until}, inclusive
                    </p>
                    <TeachingFigures row={totals} />
                    <h2 className="desk-section mt-8">Activity by offering</h2>
                    {rows.length ? (
                        <ul>
                            {rows.map((r) => (
                                <li className="portal-panel mt-3" key={r.offering}>
                                    <h3 className="font-semibold">{r.offering}</h3>
                                    <TeachingFigures row={r} />
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="desk-empty">
                            No teaching activity was recorded in this period. Choose another date range.
                        </p>
                    )}
                </section>
                <aside className="portal-panel desk-shelf">
                    <h2 className="desk-section">Reporting period</h2>
                    <Form method="get" action={`/staff/${staff.id}/activity`} className="mt-4 grid gap-3">
                        {({ errors, processing }) => (
                            <>
                                <label>
                                    From
                                    <Input
                                        type="date"
                                        name="from"
                                        defaultValue={from}
                                        required
                                    />
                                </label>
                                <label>
                                    Through
                                    <Input
                                        type="date"
                                        name="until"
                                        defaultValue={until}
                                        required
                                    />
                                </label>
                                <Button disabled={processing}>
                                    Apply dates
                                </Button>
                                {Object.entries(errors).map(([key, error]) => (
                                    <p key={key} role="alert">
                                        {error}
                                    </p>
                                ))}
                            </>
                        )}
                    </Form>
                </aside>
            </div>
        </main>
    );
}
