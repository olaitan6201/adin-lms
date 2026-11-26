import { VerifiedRecord } from '@/components/shared/records/VerifiedRecord';
import { FormFeedback } from '@/components/forms/FormFeedback';
import { Button } from '@/components/ui/button';
import { PortalField } from '@/components/forms/PortalForm';
import { RecordField } from '../academics/RecordField';
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
                    <PortalField
                        label="Staff number"
                        name="staff_number"
                        maxLength={191}
                        required
                        error={errors.staff_number}
                        announceError={false}
                    />
                    <PortalField
                        label="Verified account email"
                        name="account_email"
                        type="email"
                        required
                        error={errors.account_email}
                        announceError={false}
                    />
                    <RecordField field={{ name: 'department_id', label: 'Department', options: departments }} error={errors.department_id} />
                    <VerifiedRecord error={errors.verified}>I verified this account against the staff record.</VerifiedRecord>
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
                    <PortalField
                        label="Staff number"
                        name="staff_number"
                        required
                        error={errors.staff_number}
                        announceError={false}
                    />
                    <PortalField
                        label="Upstream offering ID"
                        name="offering"
                        required
                        error={errors.offering}
                        announceError={false}
                    />
                    <RecordField field={{ name: 'operation', label: 'Action', initial: 'assign', options: [
                        { id: 'assign', name: 'Assign' }, { id: 'remove', name: 'Remove' },
                    ] }} error={errors.operation} />
                    <Button disabled={processing}>
                        Update allocation
                    </Button>
                    {recentlySuccessful && <p role="status">Allocation saved.</p>}
                </FormFeedback>
            )}
        </Form>
    );
}
