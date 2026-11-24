import { Form, Head, Link } from '@inertiajs/react';

type Staff = { staff_number: string; full_name: string; department: string };
type Props = { staff: Staff[]; departments: { id: string; name: string }[]; previous: string | null; next: string | null };

export default function StaffDirectory({ staff, departments, previous, next }: Props) {
    return <main className="mx-auto max-w-2xl space-y-5 px-6 py-12">
        <Head title="Lecturer directory" /><Link href="/courses" className="underline">My courses</Link>
        <h1 className="text-3xl font-semibold">Lecturer directory</h1>
        <Form action="/staff" method="post" className="grid gap-3 rounded border p-4">
            {({ errors, processing, recentlySuccessful }) => <>
                <h2 className="text-xl font-semibold">Register a lecturer</h2>
                <label>Staff number <input className="block w-full border p-2" name="staff_number" maxLength={191} required /></label>
                <label>Verified account UUID <input className="block w-full border p-2" name="user_id" required /></label>
                <label>Department <select className="block w-full border p-2" name="department_id" required defaultValue="">
                    <option value="" disabled>Select department</option>
                    {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select></label>
                <label><input type="checkbox" name="verified" value="1" required /> I verified this account against the staff record.</label>
                {Object.entries(errors).map(([key, value]) => <p role="alert" key={key}>{value}</p>)}
                <button className="bg-teal-900 p-2 text-white" disabled={processing}>Register lecturer</button>
                {recentlySuccessful && <p role="status">Lecturer registered.</p>}
            </>}
        </Form>
        <Form action="/staff/allocations" method="post" className="grid gap-3 rounded border p-4">
            {({ errors, processing, recentlySuccessful }) => <>
                <h2 className="text-xl font-semibold">Teaching allocation</h2>
                <label>Staff number <input name="staff_number" className="border p-2" required /></label>
                <label>Upstream offering ID <input name="offering" className="border p-2" required /></label>
                <label>Action <select className="border p-2" name="operation"><option value="assign">Assign</option><option value="remove">Remove</option></select></label>
                {Object.entries(errors).map(([key, value]) => <p role="alert" key={key}>{value}</p>)}
                <button className="bg-teal-900 p-2 text-white" disabled={processing}>Update allocation</button>
                {recentlySuccessful && <p role="status">Allocation saved.</p>}
            </>}
        </Form>
        <h2 className="text-xl font-semibold">Registered staff</h2>
        {staff.length ? <ul>{staff.map(s => <li key={s.staff_number}>{s.full_name} · {s.staff_number} · {s.department}</li>)}</ul> : <p>No lecturer profiles yet.</p>}
        {previous && <Link href={previous}>Previous page</Link>} {next && <Link href={next}>Next page</Link>}
    </main>;
}
