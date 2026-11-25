import { Head, Link } from '@inertiajs/react';

import { ChangeAllocation, RegisterLecturer, type DepartmentOption } from '../components/staff/StaffForms';

type Staff = {
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
        <main className="mx-auto max-w-2xl space-y-5 px-6 py-12">
            <Head title="Lecturer directory" />
            <Link href="/courses" className="underline">
                My courses
            </Link>
            <h1 className="text-3xl font-semibold">Lecturer directory</h1>
            <RegisterLecturer departments={departments} />
            <ChangeAllocation />
            <h2 className="text-xl font-semibold">Registered staff</h2>
            {staff.length ? (
                <ul className="divide-y">
                    {staff.map((s) => (
                        <li key={s.staff_number} className="py-3">
                            <strong>{s.full_name}</strong> · {s.staff_number} · {s.department}
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
        </main>
    );
}
