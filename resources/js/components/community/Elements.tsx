import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { FormFeedback } from '@/components/FormFeedback';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Form, Head, Link } from '@inertiajs/react';
import type { ReactNode } from 'react';

type CommunityPageProps = {
    title: string;
    children: ReactNode;
};

export function CommunityPage({ title, children }: CommunityPageProps) {
    return (
        <main className="mx-auto grid w-full max-w-3xl gap-6 p-4 md:p-8">
            <Head title={title} />
            <nav className="flex gap-5" aria-label="Learning community">
                <Link className="underline" href="/courses">
                    My courses
                </Link>
                <Link className="underline" href="/community">
                    Inbox
                </Link>
            </nav>
            <h1 className="break-words text-3xl font-semibold">{title}</h1>
            {children}
        </main>
    );
}

export function EntryForm({
    action,
    title,
    children,
    body = true,
    resetOnSuccess = true,
}: {
    action: string;
    title: string;
    children?: ReactNode;
    body?: boolean;
    resetOnSuccess?: boolean;
}) {
    return (
        <Card><CardContent><Form action={action} method="post" resetOnSuccess={resetOnSuccess} className="grid gap-3">
            {({ processing, errors, recentlySuccessful }) => (
                <FormFeedback errors={errors}>
                    <h2 className="text-xl font-semibold">{title}</h2>
                    {children}
                    {body && (
                        <Label className="grid gap-2">
                            Message
                            <Textarea
                                name="body"
                                required
                                maxLength={10000}
                                rows={3}
                            />
                        </Label>
                    )}
                    <Button disabled={processing}>
                        {title}
                    </Button>
                    {recentlySuccessful && <p role="status">Saved.</p>}
                </FormFeedback>
            )}
        </Form></CardContent></Card>
    );
}

export type Entry = {
    id: string;
    body: string;
};
export function Announcements({ entries }: { entries: Entry[] }) {
    return (
        <section>
            <h2 className="text-xl font-semibold">Announcements</h2>
            {!entries.length && <p>No announcements yet.</p>}
            <ul>
                {entries.map((entry) => (
                    <li key={entry.id} className="whitespace-pre-wrap break-words border-b py-3">
                        {entry.body}
                    </li>
                ))}
            </ul>
        </section>
    );
}
