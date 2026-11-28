import { Head, Link } from '@inertiajs/react';
import {
    PlacementDetails,
    placementDetailHeadingId,
    placementListHeadingId,
    type PlacementRow,
    type SelectedPlacement,
} from '@/components/academics/PlacementDetails';
import type { PlacementEnrolment } from '@/components/academics/PlacementEnrolmentReview';
import RecordForm, { field } from '@/components/academics/RecordForm';
import { RegistryPagination } from '@/components/academics/RegistryPagination';
import { RegistryPanel } from '@/components/academics/RegistryPanel';
import { focusAfterRegistryNavigation } from '@/components/academics/registryFocus';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/ui/layout/PageHeader';

type Props = {
    updates: PlacementRow[];
    previous: string | null;
    next: string | null;
    listUrl: string;
    selected: SelectedPlacement | null;
    enrolments: PlacementEnrolment[];
    actions: { template: string; references: string; upload: string; approve: string | null; link: string | null };
};

export default function PlacementDesk({ updates, previous, next, selected, enrolments, actions, listUrl }: Props) {
    return (
        <main className="academic-core academic-register min-w-0 space-y-5">
            <Head title={selected ? 'Review placement update — Student placements' : 'Student placements'} />
            <PageHeader
                title="Student placements"
                description="Review numbered school records and link approved placements to enrolments."
            />
            {selected && (
                <PlacementDetails
                    key={selected.id}
                    row={selected}
                    enrolments={enrolments}
                    approve={actions.approve}
                    link={actions.link}
                    listUrl={listUrl}
                />
            )}
            <RegistryPanel
                title="Placement updates"
                subtitle="Rows waiting for review appear before approved rows."
                headingId={placementListHeadingId}
            >
                {updates.length === 0 ? (
                    <>
                        <p>{previous ? 'No placement updates on this page.' : 'No placement updates yet.'}</p>
                        {!previous && (
                            <a href="#placement-upload" className="inline-flex min-h-11 items-center underline">
                                Go to CSV upload
                            </a>
                        )}
                    </>
                ) : (
                    <ul className="divide-y rounded-md border">
                        {updates.map(row => (
                            <PlacementUpdate key={row.id} row={row} current={selected?.id === row.id} />
                        ))}
                    </ul>
                )}
                <RegistryPagination
                    label="Placement update pages"
                    item="updates"
                    previous={previous}
                    next={next}
                    headingId={placementListHeadingId}
                />
            </RegistryPanel>
            <RegistryPanel title="Upload a placement CSV" id="placement-upload">
                <p className="text-sm text-muted-foreground">
                    Use one full placement per row and keep the school’s registration ID as text. Start update numbers at 1.
                    Use the reference list to find the pathway, session, cohort and level IDs that match the school record.
                    Uploading does not approve or change a placement.
                </p>
                <div className="flex flex-wrap gap-2">
                    <Button variant="outline" asChild>
                        <a href={actions.template} download>Download CSV template</a>
                    </Button>
                    <Button variant="outline" asChild>
                        <a href={actions.references} download>Download reference IDs</a>
                    </Button>
                </div>
                <RecordForm
                    title="Send for review"
                    action={actions.upload}
                    fields={[{ ...field('file', 'Placement CSV'), type: 'file' }]}
                    resetOnSuccess
                />
            </RegistryPanel>
        </main>
    );
}

function updateStatus(row: PlacementRow) {
    if (row.accepted) {
        return 'Approved';
    }

    if (row.number === row.nextNumber) {
        return 'Review';
    }

    return `Waiting for update ${row.nextNumber}`;
}

function PlacementUpdate({ row, current }: { row: PlacementRow; current: boolean }) {
    return (
        <li>
            <Link
                id={`placement-row-${row.id}`}
                href={row.url}
                aria-current={current ? 'page' : undefined}
                className="register-row flex min-h-11 flex-wrap items-center justify-between gap-2 p-3 hover:underline"
                onSuccess={() => focusAfterRegistryNavigation(placementDetailHeadingId)}
            >
                <span className="min-w-0 wrap-anywhere">{row.registration} · Update {row.number}</span>
                <Badge variant="outline">{updateStatus(row)}</Badge>
                {current && <span className="text-sm">Selected</span>}
            </Link>
        </li>
    );
}
