import { Label } from '@/components/ui/label';
import { RecordHeading, RecordPanel } from '@/components/shared/records/WorkspaceRecord';
import { FormFeedback } from '@/components/forms/FormFeedback';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Form, Head, Link } from '@inertiajs/react';
import type { ReactNode } from 'react';

type CommunityPageProps = {
    title: string;
    children: ReactNode;
    description?: string;
};

export function CommunityPage({
    title,
    children,
    description = 'Course discussions, private messages and announcements for your learning community.',
}: CommunityPageProps) {
    return (
        <main className="grid min-w-0 gap-5 wrap-anywhere">
            <Head title={title} />
            <RecordHeading
                area="Communication"
                title={title}
                description={description}
                actions={
                    <nav className="flex flex-wrap gap-2" aria-label="Learning community">
                        <Link className="btn btn-outline btn-sm" href="/courses">
                            My courses
                        </Link>
                        <Link className="btn btn-outline btn-sm" href="/community">
                            Inbox
                        </Link>
                    </nav>
                }
            />
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
        <RecordPanel title={title}>
            <Form
                action={action}
                method="post"
                resetOnSuccess={resetOnSuccess}
                className="grid gap-3"
            >
                {({ processing, errors, recentlySuccessful }) => (
                    <FormFeedback errors={errors}>
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
                        <Button className="justify-self-start" disabled={processing}>
                            {title}
                        </Button>
                        {recentlySuccessful && <p role="status">Saved.</p>}
                    </FormFeedback>
                )}
            </Form>
        </RecordPanel>
    );
}

export type Entry = {
    id: string;
    body: string;
};
export function Announcements({ entries }: { entries: Entry[] }) {
    return (
        <RecordPanel title="Announcements" description="Notices published for your audience.">
            {!entries.length && <p>No announcements yet.</p>}
            <ul>
                {entries.map((entry) => (
                    <li key={entry.id} className="whitespace-pre-wrap break-words border-b py-3">
                        {entry.body}
                    </li>
                ))}
            </ul>
        </RecordPanel>
    );
}
