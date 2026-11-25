import { Head, Link } from '@inertiajs/react';
import RecordForm, { field } from '../components/academics/RecordForm';

import { ChangeAllocation, RegisterLecturer, type DepartmentOption } from '../components/staff/StaffForms';

type Staff = {
    id: string;
    staff_number: string;
    full_name: string;
    department: string;
    offerings: string[];
};

type Props = {
    staff: Staff[];
    departments: DepartmentOption[];
    previous: string | null;
    next: string | null;
};

export default function StaffDirectory({ staff, departments, previous, next }: Props) {
    return (
        <main className="mx-auto w-full min-w-0 max-w-6xl space-y-6 wrap-anywhere px-4 py-6 sm:px-6 lg:px-8">
            <Head title="Lecturer directory" />
            <Link href="/courses" className="text-primary underline underline-offset-4">
                My courses
            </Link>
            <header className="min-w-0 space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Staff administration</p>
                <h1 className="break-words text-3xl font-semibold tracking-tight">Lecturer directory</h1>
                <p>Review teaching records, update departments and manage class allocations.</p>
            </header>
            <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
                <section>
                    <h2 className="text-xl font-semibold tracking-tight">Registered staff</h2>
                    {staff.length ? (
                        <ul className="divide-y">
                            {staff.map((s) => (
                                <li key={s.staff_number} className="py-3">
                                    <strong>{s.full_name}</strong> · {s.staff_number} · {s.department}
                                    <p>
                                        <Link href={`/staff/${s.id}/activity`} className="text-primary underline underline-offset-4">
                                            View teaching activity
                                        </Link>
                                    </p>
                                    <details>
                                        <summary className="cursor-pointer py-2 font-medium">Transfer department</summary>
                                        <RecordForm
                                            method="patch"
                                            title="Save department"
                                            action={`/staff/${s.id}/department`}
                                            fields={[field('department_id', 'New department', departments)]}
                                        />
                                    </details>
                                    <details>
                                        <summary className="cursor-pointer">
                                            Teaching allocations ({s.offerings.length})
                                        </summary>
                                        {s.offerings.length ? (
                                            <ul className="list-inside list-disc">
                                                {s.offerings.map((id) => (
                                                    <li key={id}>{id}</li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <p>No teaching allocations.</p>
                                        )}
                                    </details>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p>No lecturer profiles yet.</p>
                    )}
                    {previous && <Link href={previous}>Previous page</Link>}{' '}
                    {next && <Link href={next}>Next page</Link>}
                </section>
                <aside className="min-w-0 space-y-4 rounded-lg border bg-card p-4 text-card-foreground sm:p-6">
                    <h2 className="text-xl font-semibold tracking-tight">Staff actions</h2>
                    <details>
                        <summary className="cursor-pointer py-3 font-semibold">Register a lecturer</summary>
                        <RegisterLecturer departments={departments} />
                    </details>
                    <details>
                        <summary className="cursor-pointer py-3 font-semibold">Change a teaching allocation</summary>
                        <ChangeAllocation />
                    </details>
                </aside>
            </div>
        </main>
    );
}
