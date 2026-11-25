import { Form, Head, Link } from '@inertiajs/react';
import RecordForm, { field } from '../../components/academics/RecordForm';
import { DeskHeading } from '../../components/academics/DeskHeading';

type Account = {
    id: string;
    full_name: string;
    email: string;
    status: string;
};
type Props = {
    accounts: Account[];
    self: string;
    grant: boolean;
    q: string;
    previous: string | null;
    next: string | null;
};
export default function Accounts({ accounts, self, grant, q, previous, next }: Props) {
    return (
        <main className="portal-page space-y-4">
            <Head title="Account administration" />
            <DeskHeading area="Identity and access" title="Account administration">
                Find an institutional account to review access or change its LMS status.
            </DeskHeading>
            <details>
                <summary>Provision an LMS account</summary>
                <p>The account holder sets their password using the link sent by email.</p>
                <RecordForm
                    action="/accounts"
                    title="Provision account"
                    fields={[
                        field('full_name', 'Full name'),
                        { ...field('email', 'Institutional email'), type: 'email' },
                    ]}
                />
            </details>
            <Form action="/accounts" method="get">
                <label>
                    Find by name or email <input name="q" defaultValue={q} className="border p-2" />
                </label>
                <button className="p-2 underline">Search</button>
            </Form>
            {!accounts.length && <p>No matching accounts.</p>}
            <ul className="divide-y">
                {accounts.map((a) => (
                    <li key={a.id} className="space-y-2 py-3">
                        <strong>{a.full_name}</strong> · {a.email} · {a.status}
                        {grant && (
                            <p>
                                <Link className="underline" href={`/accounts/${a.id}/access`}>
                                    Inspect roles and permissions
                                </Link>
                            </p>
                        )}
                        {a.id !== self && (
                            <details>
                                <summary>Change access status</summary>
                                <Form action={`/accounts/${a.id}`} method="patch">
                                    {({ errors, processing }) => (
                                        <>
                                            <input
                                                type="hidden"
                                                name="status"
                                                value={a.status === 'active' ? 'suspended' : 'active'}
                                            />
                                            <button disabled={processing} className="underline">
                                                {a.status === 'active' ? 'Suspend' : 'Reactivate'} {a.full_name}
                                            </button>
                                            {errors.status && <p role="alert">{errors.status}</p>}
                                        </>
                                    )}
                                </Form>
                            </details>
                        )}
                    </li>
                ))}
            </ul>
            {previous && <Link href={previous}>Previous page</Link>} {next && <Link href={next}>Next page</Link>}
        </main>
    );
}
