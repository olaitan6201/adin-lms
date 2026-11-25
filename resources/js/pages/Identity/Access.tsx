import { Form, Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import { DeskHeading } from '../../components/academics/DeskHeading';

type Grant = { id: string; role: string; scope: string; permissions: string[] };
type Props = {
    account: { id: string; full_name: string; email: string };
    editable: boolean;
    roles: { code: string; scope: string }[];
    grants: Grant[];
};
const label = (value: string) => value.split('_').join(' ');
export default function Access({ account, editable, grants, roles }: Props) {
    const [role, selectRole] = useState('');
    const scope = roles.find((r) => r.code === role)?.scope;
    const path = `/accounts/${account.id}/access`;
    return (
        <main className="portal-page space-y-4">
            <Head title="Account permissions" />
            <Link href="/accounts" className="underline">
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
                                    <button disabled={processing} className="underline">
                                        Revoke {label(g.role)} for {g.scope}
                                    </button>
                                )}
                            </Form>
                        )}
                    </li>
                ))}
            </ul>
            {editable && (
                <Form action={path} method="post" className="grid gap-3">
                    {({ errors, processing }) => (
                        <>
                            <label>
                                Assign role{' '}
                                <select
                                    name="role"
                                    required
                                    value={role}
                                    onChange={(e) => selectRole(e.target.value)}
                                >
                                    <option value="">Choose a role</option>
                                    {roles.map((r) => (
                                        <option key={r.code} value={r.code}>
                                            {label(r.code)}
                                        </option>
                                    ))}
                                </select>
                            </label>
                            {scope && scope !== 'institution' && (
                                <label>
                                    {scope === 'offering' ? 'Upstream offering ID' : `${scope} code`}{' '}
                                    <input key={scope} className="border p-2" name="reference" required />
                                </label>
                            )}
                            {scope === 'institution' && <p>This grant applies institution-wide.</p>}
                            {Object.entries(errors).map(([key, error]) => (
                                <p role="alert" key={key}>
                                    {error}
                                </p>
                            ))}
                            <button
                                disabled={processing}
                                className="justify-self-start rounded bg-teal-900 px-4 py-2 text-white"
                            >
                                Grant role
                            </button>
                        </>
                    )}
                </Form>
            )}
        </main>
    );
}
