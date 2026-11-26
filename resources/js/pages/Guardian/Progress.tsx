import { RecordHeading, RecordPanel } from '@/components/shared/records/WorkspaceRecord';
import { ShieldCheck } from 'lucide-react';
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

function ApprovedRecords({ approvals, previous, next }: Pick<Props, 'previous' | 'next'> & { approvals: NonNullable<Props['approvals']> }) {
    return (
        <RecordPanel title="Approved records" description="Select a student reference to view completed lessons.">
            {approvals.length ? (
                <ul className="divide-y divide-ink-100">
                    {approvals.map(({ reference, href }) => (
                        <li key={href}>
                            <Link
                                className="grid gap-1 py-2 text-primary underline underline-offset-4"
                                href={href}
                                id={`record-${reference}`}
                                onSuccess={() => focusAfterVisit('progress-title')}
                            >
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
        </RecordPanel>
    );
}

export default function Progress({ approvals, completed_lessons, previous, next, reference, recordsUrl }: Props) {
    return (
        <main className="grid min-w-0 gap-5">
            <Head title="Shared progress" />
            <RecordHeading
                area="Guardian access"
                focusId="progress-title"
                title={reference ? `Shared progress · ${reference}` : 'Shared progress'}
                description="Lesson completion shared with you by the institution."
            />
            <p className="flex gap-3 rounded-lg border border-sky-200 bg-sky-50 p-4 text-[13px] text-sky-900">
                <ShieldCheck aria-hidden="true" size={18} className="shrink-0" />
                Your access is limited to approved records. Only the institution can change what is shared.
            </p>
            <div className="grid items-start gap-5 xl:grid-cols-2">
                {approvals ? (
                    <ApprovedRecords approvals={approvals} previous={previous} next={next} />
                ) : (
                    <RecordPanel title="Completed lessons" description={`Student reference: ${reference}`}>
                        <p className="kpi-value tabular-nums">{completed_lessons}</p>
                        <p>Across current course registrations.</p>
                        <Link
                            className="text-primary underline underline-offset-4"
                            href={recordsUrl ?? '/guardian'}
                            onSuccess={() => focusAfterVisit(`record-${reference}`)}
                        >
                            Back to approved records
                        </Link>
                    </RecordPanel>
                )}
                <RecordPanel title="Not visible to a guardian" description="This view shares lesson completion totals only.">
                    <ul className="list-disc space-y-2 pl-4 text-[13px] text-ink-700">
                        <li>Grades, submissions and examination records</li>
                        <li>Private messages and course discussions</li>
                        <li>Students’ records without an active permission</li>
                    </ul>
                </RecordPanel>
            </div>
        </main>
    );
}
