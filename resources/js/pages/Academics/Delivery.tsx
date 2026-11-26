import type { DeliveryProps } from '../../components/academics/deliveryTypes';
import { Head, Link } from '@inertiajs/react';
import { RegistryFigures, RegistryPanel, RegistryTable } from '@/components/academics/RegistryPanel';
import { DeskHeading } from '@/components/academics/DeskHeading';

import { OfferingRegisterRow } from '@/components/academics/OfferingRegisterRow';

type Pending = {
    offering_id: string;
    external_offering_id: string;
    revision: number;
};

export default function Delivery({
    offerings,
    entries,
    terms,
    modes,
    pendingPlans,
}: DeliveryProps & { pendingPlans: Pending[] }) {
    return (
        <main className="w-full min-w-0 space-y-5 wrap-anywhere">
            <Head title="Offering delivery" />
            <Link href="/courses" className="text-primary underline underline-offset-4">
                My courses
            </Link>
            <DeskHeading area="Course delivery" title="Offering delivery">
                Prepare an upstream section, assign its lecturer in the staff directory, then publish.
            </DeskHeading>
            <RegistryPanel title="Delivery pipeline" subtitle="Offerings by publication state">
                <RegistryFigures
                    values={Object.fromEntries(
                        ['draft', 'published', 'unpublished', 'archived'].map((status) => [
                            status[0].toUpperCase() + status.slice(1),
                            offerings.filter((o) => o.status === status).length,
                        ]),
                    )}
                />
            </RegistryPanel>
            <RegistryPanel title="Teaching plans awaiting review">
                {pendingPlans.length ? (
                    <ul>
                        {pendingPlans.map((p) => (
                            <li key={p.offering_id}>
                                <Link
                                    className="text-primary underline underline-offset-4"
                                    href={`/courses/${p.offering_id}/learning/teaching-plan`}
                                >
                                    Review {p.external_offering_id} · revision {p.revision}
                                </Link>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>No teaching plans awaiting review.</p>
                )}
            </RegistryPanel>
            <RegistryPanel title="Course offerings" subtitle="Preparation, publication and teaching plan history">
                {!offerings.length && <p>No roster offerings yet.</p>}
                {offerings.length > 0 && (
                    <RegistryTable
                        grouped
                        title="Offering register"
                        columns={['Course', 'Term', 'Mode', 'State', 'Actions']}
                    >
                        {offerings.map((o) => (
                            <OfferingRegisterRow key={o.id} {...{ o, entries, terms, modes, offerings }} />
                        ))}
                    </RegistryTable>
                )}
            </RegistryPanel>
        </main>
    );
}
