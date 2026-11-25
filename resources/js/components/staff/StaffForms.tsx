import { FormFeedback } from '@/components/ui/form-feedback';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { NativeSelect } from '@/components/ui/native-select';
import { Form } from '@inertiajs/react';

export type DepartmentOption = {
    id: string;
    name: string;
};

export function RegisterLecturer({ departments }: { departments: DepartmentOption[] }) {
    return (
        <Form action="/staff" method="post" className="grid gap-3 rounded border p-4">
            {({ errors, processing, recentlySuccessful }) => (
                <FormFeedback errors={errors}>
                    <h2 className="text-xl font-semibold">Register a lecturer</h2>
                    <label>
                        Staff number{' '}
                        <Input name="staff_number" maxLength={191} required />
                    </label>
                    <label>
                        Verified account email{' '}
                        <Input type="email" name="account_email" required />
                    </label>
                    <label>
                        Department{' '}
                        <NativeSelect name="department_id" required defaultValue="">
                            <option value="" disabled>
                                Select department
                            </option>
                            {departments.map((d) => (
                                <option key={d.id} value={d.id}>
                                    {d.name}
                                </option>
                            ))}
                        </NativeSelect>
                    </label>
                    <label>
                        <input type="checkbox" name="verified" value="1" required /> I verified this account against the
                        staff record.
                    </label>
                    <Button disabled={processing}>
                        Register lecturer
                    </Button>
                    {recentlySuccessful && <p role="status">Lecturer registered.</p>}
                </FormFeedback>
            )}
        </Form>
    );
}

export function ChangeAllocation() {
    return (
        <Form action="/staff/allocations" method="post" className="grid gap-3 rounded border p-4">
            {({ errors, processing, recentlySuccessful }) => (
                <FormFeedback errors={errors}>
                    <h2 className="text-xl font-semibold">Teaching allocation</h2>
                    <label>
                        Staff number <Input name="staff_number" required />
                    </label>
                    <label>
                        Upstream offering ID <Input name="offering" required />
                    </label>
                    <label>
                        Action{' '}
                        <NativeSelect name="operation">
                            <option value="assign">Assign</option>
                            <option value="remove">Remove</option>
                        </NativeSelect>
                    </label>
                    <Button disabled={processing}>
                        Update allocation
                    </Button>
                    {recentlySuccessful && <p role="status">Allocation saved.</p>}
                </FormFeedback>
            )}
        </Form>
    );
}
