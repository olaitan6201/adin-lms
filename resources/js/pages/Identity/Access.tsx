import { Button } from '@/components/ui/button';
import { NativeSelect } from '@/components/ui/native-select';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { FormFeedback } from '@/components/ui/form-feedback';
import { PortalField } from '../../components/PortalForm';
import { Form, Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import { DeskHeading } from '../../components/academics/DeskHeading';

type Grant = {
    id: string;
    role: string;
    scope: string;
    permissions: string[];
};
type Props = {
    account: {
        id: string;
        full_name: string;
        email: string;
    };
    editable: boolean;
    roles: {
        code: string;
        scope: string;
    }[];
    grants: Grant[];
};
const label = (value: string) => value.split('_').join(' ');
export default function Access({ account, editable, grants, roles }: Props) {
    const [role, selectRole] = useState('');
    const scope = roles.find((r) => r.code === role)?.scope;
    const path = `/accounts/${account.id}/access`;
    return (
        <main className="mx-auto w-full min-w-0 max-w-6xl space-y-6 wrap-anywhere px-4 py-6 sm:px-6 lg:px-8">
            <Head title="Account permissions" />
            <Link href="/accounts" className="text-primary underline underline-offset-4">
                Account directory
            </Link>
            <DeskHeading area="Identity and access" title={`${account.full_name}: roles and permissions`}>
                {account.email}
            </DeskHeading>
            {!grants.length && <p>No roles assigned.</p>}
            <ul className="divide-y">
                {grants.map((g) => (
                    <li key={g.id} className="py-3">
                        <strong>{label(g.role)}</strong> · {g.scope}
                        <p>{g.permissions.join(', ')}</p>
                        {editable && (
                            <Form action={`${path}/${g.id}`} method="delete">
                                {({ processing }) => (
                                    <Button className="h-auto min-h-9 max-w-full whitespace-normal break-words" variant="destructive" disabled={processing}>
                                        Revoke {label(g.role)} for {g.scope}
                                    </Button>
                                )}
                            </Form>
                        )}
                    </li>
                ))}
            </ul>
            {editable && (
                <Form action={path} method="post" className="grid gap-3">
                    {({ errors, processing }) => (
                        <FormFeedback errors={errors}>
                            <Field data-invalid={errors.role ? true : undefined}>
                                <FieldLabel htmlFor="assign-role">Assign role</FieldLabel>
                                <NativeSelect id="assign-role" name="role" required value={role}
                                    aria-invalid={errors.role ? true : undefined}
                                    aria-describedby={errors.role ? 'assign-role-error' : undefined}
                                    onChange={(e) => selectRole(e.target.value)}>
                                    <option value="">Choose a role</option>
                                    {roles.map((r) => (
                                        <option key={r.code} value={r.code}>
                                            {label(r.code)}
                                        </option>
                                    ))}
                                </NativeSelect>
                                <FieldError id="assign-role-error" role={undefined}>{errors.role}</FieldError>
                            </Field>
                            {scope && scope !== 'institution' && (
                                <PortalField key={scope} name="reference" required error={errors.reference}
                                    announceError={false} label={scope === 'offering' ? 'Upstream offering ID' : `${scope} code`} />
                            )}
                            {scope === 'institution' && <p>This grant applies institution-wide.</p>}
                            <Button className="justify-self-start"
                                disabled={processing}
                            >
                                Grant role
                            </Button>
                        </FormFeedback>
                    )}
                </Form>
            )}
        </main>
    );
}
