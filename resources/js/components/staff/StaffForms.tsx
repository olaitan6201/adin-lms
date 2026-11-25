import { Form } from '@inertiajs/react';

export type DepartmentOption = {
    id: string;
    name: string;
};

export function RegisterLecturer({ departments }: { departments: DepartmentOption[] }) {
    return (
        <Form action="/staff" method="post" className="grid gap-3 rounded border p-4">
            {({ errors, processing, recentlySuccessful }) => (
                <>
                    <h2 className="text-xl font-semibold">Register a lecturer</h2>
                    <label>
                        Staff number{' '}
                        <input className="block w-full border p-2" name="staff_number" maxLength={191} required />
                    </label>
                    <label>
                        Verified account email{' '}
                        <input className="block w-full border p-2" type="email" name="account_email" required />
                    </label>
                    <label>
                        Department{' '}
                        <select className="block w-full border p-2" name="department_id" required defaultValue="">
                            <option value="" disabled>
                                Select department
                            </option>
                            {departments.map((d) => (
                                <option key={d.id} value={d.id}>
                                    {d.name}
                                </option>
                            ))}
                        </select>
                    </label>
                    <label>
                        <input type="checkbox" name="verified" value="1" required /> I verified this account against the
                        staff record.
                    </label>
                    {Object.entries(errors).map(([key, value]) => (
                        <p role="alert" key={key}>
                            {value}
                        </p>
                    ))}
                    <button className="bg-teal-900 p-2 text-white" disabled={processing}>
                        Register lecturer
                    </button>
                    {recentlySuccessful && <p role="status">Lecturer registered.</p>}
                </>
            )}
        </Form>
    );
}

export function ChangeAllocation() {
    return (
        <Form action="/staff/allocations" method="post" className="grid gap-3 rounded border p-4">
            {({ errors, processing, recentlySuccessful }) => (
                <>
                    <h2 className="text-xl font-semibold">Teaching allocation</h2>
                    <label>
                        Staff number <input name="staff_number" className="border p-2" required />
                    </label>
                    <label>
                        Upstream offering ID <input name="offering" className="border p-2" required />
                    </label>
                    <label>
                        Action{' '}
                        <select className="border p-2" name="operation">
                            <option value="assign">Assign</option>
                            <option value="remove">Remove</option>
                        </select>
                    </label>
                    {Object.entries(errors).map(([key, value]) => (
                        <p role="alert" key={key}>
                            {value}
                        </p>
                    ))}
                    <button className="bg-teal-900 p-2 text-white" disabled={processing}>
                        Update allocation
                    </button>
                    {recentlySuccessful && <p role="status">Allocation saved.</p>}
                </>
            )}
        </Form>
    );
}
