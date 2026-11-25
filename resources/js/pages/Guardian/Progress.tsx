import { Card, CardContent } from '@/components/ui/card';
import { Head, Link } from '@inertiajs/react';

type Props = {
    approvals?: {
        reference: string;
        href: string;
    }[];
    previous?: string | null;
    next?: string | null;
    completed_lessons?: number;
    reference?: string;
    recordsUrl?: string;
};

function focusAfterVisit(id: string) {
    requestAnimationFrame(() => document.getElementById(id)?.focus());
}

export default function Progress({ approvals, completed_lessons, previous, next, reference, recordsUrl }: Props) {
    return (
        <main className="mx-auto grid w-full max-w-5xl gap-6 p-4 md:p-8">
            <Head title="Shared progress" />
            <header className="space-y-2">
                <p className="text-sm text-muted-foreground">Guardian workspace</p>
                <h1 id="progress-title" tabIndex={-1} className="break-words text-3xl font-semibold tracking-tight">{reference ? `Shared progress · ${reference}` : 'Shared progress'}</h1>
                <p>Lesson completion shared with you by the institution.</p>
            </header>
            {approvals ? (
                <Card><CardContent className="grid gap-3">
                    <h2 className="text-xl font-semibold">Approved records</h2>
                    {approvals.length ? (
                        <ul>
                            {approvals.map(({ reference, href }) => (
                                <li key={href}>
                                    <Link className="grid gap-1 py-2 text-primary underline underline-offset-4" href={href} id={`record-${reference}`} onSuccess={() => focusAfterVisit('progress-title')}>
                                        View progress · {reference}
                                        <small>Completed lessons</small>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="py-3 text-muted-foreground">No progress records are currently shared with you.</p>
                    )}
                    <nav aria-label="Records pages">
                        {previous && (
                            <Link className="text-primary underline underline-offset-4" href={previous}>
                                Previous records
                            </Link>
                        )}
                        {next && (
                            <Link className="text-primary underline underline-offset-4" href={next}>
                                More records
                            </Link>
                        )}
                    </nav>
                </CardContent></Card>
            ) : (
                <Card><CardContent className="grid gap-3">
                    <h2 className="text-xl font-semibold">Completed lessons</h2>
                    <p className="my-3 text-4xl font-semibold tabular-nums">{completed_lessons}</p>
                    <p>Across current course registrations.</p>
                    <Link className="text-primary underline underline-offset-4" href={recordsUrl ?? '/guardian'} onSuccess={() => focusAfterVisit(`record-${reference}`)}>
                        Back to approved records
                    </Link>
                </CardContent></Card>
            )}
        </main>
    );
}
