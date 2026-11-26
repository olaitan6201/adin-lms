import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Form, Head, Link } from '@inertiajs/react';
import RecordForm, { field } from '../../components/academics/RecordForm';
import { DeskHeading } from '../../components/academics/DeskHeading';
import { RegistryPanel, RegistryTable } from '@/components/academics/RegistryPanel';

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
        <main className="w-full min-w-0 space-y-5 wrap-anywhere">
            <Head title="Account administration" />
            <DeskHeading area="Identity and access" title="Account administration">
                Find an institutional account to review access or change its LMS status.
            </DeskHeading>
            <RegistryPanel title="Account directory" subtitle="Institutional identities and LMS access">
            <Collapsible>
                <CollapsibleTrigger asChild>
                    <Button type="button" variant="outline" className="h-auto min-h-9 max-w-full whitespace-normal text-start">
                        Provision an LMS account
                    </Button>
                </CollapsibleTrigger>
                <CollapsibleContent forceMount className="space-y-3 pt-3 data-[state=closed]:hidden">
                    <p>The account holder sets their password using the link sent by email.</p>
                    <RecordForm
                        action="/accounts"
                        title="Provision account"
                        fields={[
                            field('full_name', 'Full name'),
                            { ...field('email', 'Institutional email'), type: 'email' },
                        ]}
                    />
                </CollapsibleContent>
            </Collapsible>
            <Form action="/accounts" method="get" className="flex flex-wrap items-end gap-3 border-b border-ink-100 pb-4">
                <label className="grid gap-2 text-sm font-medium">
                    Find by name or email <Input name="q" defaultValue={q} />
                </label>
                <Button>Search</Button>
            </Form>
            {!accounts.length && <p>No matching accounts.</p>}
            <RegistryTable title="Matching accounts" columns={['Account', 'Status', 'Access controls']}>
                {accounts.map((a) => (
                    <tr key={a.id}>
                        <td><strong>{a.full_name}</strong><div className="text-xs text-ink-500">{a.email}</div></td>
                        <td><span className="badge bg-ink-50 text-ink-700">{a.status}</span></td>
                        <td className="space-y-2">
                        {grant && (
                            <p>
                                <Link className="text-primary underline underline-offset-4" href={`/accounts/${a.id}/access`}>
                                    Inspect roles and permissions
                                </Link>
                            </p>
                        )}
                        {a.id !== self && (
                            <Collapsible>
                                <CollapsibleTrigger asChild>
                                    <Button type="button" variant="outline" className="h-auto min-h-9 max-w-full whitespace-normal text-start">
                                        Change access status
                                    </Button>
                                </CollapsibleTrigger>
                                <CollapsibleContent forceMount className="space-y-3 pt-3 data-[state=closed]:hidden">
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
                                </CollapsibleContent>
                            </Collapsible>
                        )}
                        </td>
                    </tr>
                ))}
            </RegistryTable>
            {previous && <Link href={previous}>Previous page</Link>} {next && <Link href={next}>Next page</Link>}
            </RegistryPanel>
        </main>
    );
}
