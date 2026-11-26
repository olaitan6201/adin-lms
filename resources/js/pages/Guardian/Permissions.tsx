import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { RecordHeading, RecordPanel } from '@/components/shared/records/WorkspaceRecord';
import { Button } from '@/components/ui/button';
import { Form, Head, Link } from '@inertiajs/react';
import { ApproveSharing } from '@/components/guardian/ApproveSharing';

type Entry = {
    id: string;
    guardian: string;
    student: string;
    revoked: boolean;
    fields: string[];
};
type Props = {
    entries: Entry[];
    previous: string | null;
    next: string | null;
};

function PermissionEntry({ entry }: { entry: Entry }) {
    return (
        <li className="py-4 break-words">
            <span className={entry.revoked ? 'badge bg-ink-100 text-ink-700' : 'badge bg-emerald-50 text-emerald-800'}>
                {entry.revoked ? 'Revoked' : 'Active'}
            </span>
            <h3 className="font-semibold">{entry.guardian}</h3>
            <p>Student reference: {entry.student}</p>
            <p>Fields: {entry.fields.join(', ').replaceAll('_', ' ')}</p>
            {!entry.revoked && (
                <Collapsible>
                    <CollapsibleTrigger asChild>
                        <Button variant="outline" type="button">
                            Revoke access
                        </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="py-2">
                        <Form method="delete" action={`/guardian/permissions/${entry.id}`}>
                            {({ processing }) => (
                                <Button variant="destructive" disabled={processing}>
                                    Confirm revocation
                                </Button>
                            )}
                        </Form>
                    </CollapsibleContent>
                </Collapsible>
            )}
        </li>
    );
}

export default function Permissions({ entries, previous, next }: Props) {
    return (
        <main className="grid min-w-0 gap-5">
            <Head title="Guardian permissions" />
            <RecordHeading
                area="Access administration"
                title="Guardian permissions"
                description="Manage who can see a student's completed lesson count."
            />
            <div className="grid items-start gap-6 lg:grid-cols-2">
                <RecordPanel title="Permission register">
                    {entries.length ? (
                        <ul className="mt-4 divide-y">
                            {entries.map((e) => (
                                <PermissionEntry key={e.id} entry={e} />
                            ))}
                        </ul>
                    ) : (
                        <p className="py-3 text-muted-foreground">No permissions recorded.</p>
                    )}
                    <nav aria-label="Permission pages">
                        {previous && (
                            <Link className="text-primary underline underline-offset-4" href={previous}>
                                Previous permissions
                            </Link>
                        )}
                        {next && (
                            <Link className="text-primary underline underline-offset-4" href={next}>
                                More permissions
                            </Link>
                        )}
                    </nav>
                </RecordPanel>
                <ApproveSharing />
            </div>
        </main>
    );
}
