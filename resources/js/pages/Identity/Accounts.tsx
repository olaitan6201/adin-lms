import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
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
        <main className="mx-auto w-full min-w-0 max-w-6xl space-y-6 wrap-anywhere px-4 py-6 sm:px-6 lg:px-8">
            <Head title="Account administration" />
            <DeskHeading area="Identity and access" title="Account administration">
                Find an institutional account to review access or change its LMS status.
            </DeskHeading>
            <details>
                <summary className="cursor-pointer py-2 font-medium">Provision an LMS account</summary>
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
            <Form action="/accounts" method="get" className="grid max-w-xl gap-3">
                <label className="grid gap-2 text-sm font-medium">
                    Find by name or email <Input name="q" defaultValue={q} />
                </label>
                <Button>Search</Button>
            </Form>
            {!accounts.length && <p>No matching accounts.</p>}
            <ul className="divide-y">
                {accounts.map((a) => (
                    <li key={a.id} className="space-y-2 py-3">
                        <strong>{a.full_name}</strong> · {a.email} · {a.status}
                        {grant && (
                            <p>
                                <Link className="text-primary underline underline-offset-4" href={`/accounts/${a.id}/access`}>
                                    Inspect roles and permissions
                                </Link>
                            </p>
                        )}
                        {a.id !== self && (
                            <details>
                                <summary className="cursor-pointer py-2 font-medium">Change access status</summary>
                                <Form action={`/accounts/${a.id}`} method="patch">
                                    {({ errors, processing }) => (
                                        <>
                                            <input
                                                type="hidden"
                                                name="status"
                                                value={a.status === 'active' ? 'suspended' : 'active'}
                                            />
                                            <Button className="h-auto min-h-9 max-w-full whitespace-normal break-words" disabled={processing}>
                                                {a.status === 'active' ? 'Suspend' : 'Reactivate'} {a.full_name}
                                            </Button>
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
