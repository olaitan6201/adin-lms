import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { FormFeedback } from '@/components/FormFeedback';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Form, Head, Link } from '@inertiajs/react';

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

export default function Permissions({ entries, previous, next }: Props) {
    return (
        <main className="mx-auto grid w-full max-w-5xl gap-6 p-4 md:p-8">
            <Head title="Guardian permissions" />
            <header className="space-y-2">
                <p className="text-sm text-muted-foreground">Access administration</p>
                <h1 className="break-words text-3xl font-semibold tracking-tight">Guardian permissions</h1>
                <p>Manage who can see a student's completed lesson count.</p>
            </header>
            <div className="grid items-start gap-6 lg:grid-cols-2">
                <section>
                    <h2 className="text-xl font-semibold">Permission register</h2>
                    {entries.length ? (
                        <ul className="mt-4 divide-y">
                            {entries.map((e) => (
                                <li className="py-4 break-words" key={e.id}>
                                    <p className="text-sm text-muted-foreground">{e.revoked ? 'Revoked' : 'Active'}</p>
                                    <h3 className="font-semibold">{e.guardian}</h3>
                                    <p>Student reference: {e.student}</p>
                                    <p>Fields: {e.fields.join(', ').replaceAll('_', ' ')}</p>
                                    {!e.revoked && (
                                        <Collapsible>
                                            <CollapsibleTrigger asChild><Button variant="outline" type="button">
                                                Revoke access
                                            </Button></CollapsibleTrigger>
                                            <CollapsibleContent className="py-2">
                                            <Form method="delete" action={`/guardian/permissions/${e.id}`}>
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
                </section>
                <Card><CardContent>
                    <h2 className="text-xl font-semibold">Approve sharing</h2>
                    <Form action="/guardian/permissions" method="post" resetOnSuccess className="mt-4 grid gap-4">
                        {({ errors, processing, recentlySuccessful }) => (
                            <FormFeedback errors={errors}>
                                <Label className="grid gap-2">
                                    Guardian account email
                                    <Input
                                        type="email"
                                        name="guardian_email"
                                        required
                                    />
                                </Label>
                                <Label className="grid gap-2">
                                    Upstream student reference
                                    <Input name="student_reference" required />
                                </Label>
                                <p className="text-sm text-muted-foreground">
                                    The account must already hold the guardian role. Only lesson completion totals will
                                    be shared.
                                </p>
                                <Label className="grid gap-2">
                                    <Checkbox name="confirmed" value="1" required /> I verified
                                    authorization to share this student's progress with this guardian.
                                </Label>
                                <Button disabled={processing}>
                                    Approve progress access
                                </Button>
                                {recentlySuccessful && <p role="status">Permission saved.</p>}
                            </FormFeedback>
                        )}
                    </Form>
                </CardContent></Card>
            </div>
        </main>
    );
}
