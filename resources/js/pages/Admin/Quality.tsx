import { Head, Link } from '@inertiajs/react';
import { DeskHeading } from '@/components/academics/DeskHeading';
import { RegistryFigures, RegistryPanel, RegistryTable } from '@/components/academics/RegistryPanel';

type Version = { programme: string; version: number; framework: string | null; href: string };
type Props = {
    approvedCount: number;
    reviewedCount: number;
    catalogueHref: string;
    evidence: (Version & { mapped: number; outcomes: number })[];
    queue: Version[];
};

function VersionLink({ row }: { row: Version }) {
    return <Link className="font-semibold text-brand-700 underline underline-offset-4" href={row.href}>
        {row.programme} · v{row.version}
    </Link>;
}

export default function Quality({ approvedCount, reviewedCount, catalogueHref, evidence, queue }: Props) {
    return <main className="w-full min-w-0 space-y-5 wrap-anywhere">
        <Head title="QA and compliance" />
        <DeskHeading area="Quality assurance" title="QA and compliance">
            Inspect outcome coverage in approved curricula and track versions awaiting approval.
        </DeskHeading>
        <RegistryPanel title="Catalogue overview" subtitle="Institution-wide curriculum versions"
            actions={<Link className="btn btn-outline btn-sm" href={catalogueHref}>Open catalogue</Link>}>
            <RegistryFigures values={{ 'Approved versions': approvedCount, 'Awaiting approval': reviewedCount }} />
        </RegistryPanel>
        <RegistryPanel title="Outcome mapping evidence"
            subtitle={`Showing ${evidence.length} of ${approvedCount} approved versions. Open a version to inspect its mapping matrix.`}>
            {evidence.length ? <RegistryTable title="Approved curriculum evidence" columns={['Programme version', 'Framework revision', 'Programme outcomes mapped']}>
                {evidence.map(row => <tr key={row.href}>
                    <th scope="row" className="px-4 py-3 text-left"><VersionLink row={row} /></th>
                    <td>{row.framework || 'Not recorded'}</td>
                    <td>{row.outcomes ? `${row.mapped} of ${row.outcomes}` : 'No outcomes recorded'}</td>
                </tr>)}
            </RegistryTable> : <p>No approved curriculum versions to inspect.</p>}
        </RegistryPanel>
        <RegistryPanel title="Review queue" subtitle={`Showing ${queue.length} of ${reviewedCount} reviewed versions awaiting approval.`}>
            {queue.length ? <ul className="divide-y divide-ink-100">
                {queue.map(row => <li key={row.href} className="flex flex-wrap items-center justify-between gap-2 py-3">
                    <VersionLink row={row} />
                    <span className="badge bg-amber-50 text-amber-800">Awaiting approval</span>
                </li>)}
            </ul> : <p>No reviewed versions are awaiting approval.</p>}
        </RegistryPanel>
    </main>;
}
