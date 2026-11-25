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
        <main className="portal-page">
            <Head title="Lecturer directory" />
            <Link href="/courses" className="underline">
                My courses
            </Link>
            <header className="desk-heading"><p className="portal-kicker">Staff administration</p>
                <h1 className="portal-title">Lecturer directory</h1>
                <p>Review teaching records, update departments and manage class allocations.</p></header>
            <div className="desk-grid"><section><h2 className="desk-section">Registered staff</h2>
            {staff.length ? (
                <ul className="divide-y">
                    {staff.map((s) => (
                        <li key={s.staff_number} className="py-3">
                            <strong>{s.full_name}</strong> · {s.staff_number} · {s.department}
                            <p><Link href={`/staff/${s.id}/activity`} className="underline">View teaching activity</Link></p>
                            <details><summary>Transfer department</summary>
                                <RecordForm method="patch" title="Save department" action={`/staff/${s.id}/department`}
                                    fields={[field('department_id', 'New department', departments)]} />
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
            </section><aside className="portal-panel desk-shelf space-y-4">
                <h2 className="desk-section">Staff actions</h2>
                <details><summary className="cursor-pointer py-3 font-semibold">Register a lecturer</summary>
                    <RegisterLecturer departments={departments} /></details>
                <details><summary className="cursor-pointer py-3 font-semibold">Change a teaching allocation</summary>
                    <ChangeAllocation /></details>
            </aside></div>
        </main>
    );
}
