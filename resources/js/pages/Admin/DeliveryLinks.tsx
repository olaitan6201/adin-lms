import { Head, Link } from '@inertiajs/react';
import {
    DeliveryLinkDetails,
    deliveryDetailHeadingId,
    deliveryListHeadingId,
    type DeliveryCandidate,
    type SelectedOffering,
} from '@/components/academics/DeliveryLinkDetails';
import type { Choice } from '@/components/academics/RecordForm';
import { RegistryPagination } from '@/components/academics/RegistryPagination';
import { RegistryPanel } from '@/components/academics/RegistryPanel';
import { focusAfterRegistryNavigation } from '@/components/academics/registryFocus';
import { PageHeader } from '@/components/ui/layout/PageHeader';

type Props = {
    offerings: (Choice & { url: string })[];
    candidates: DeliveryCandidate[];
    selected: SelectedOffering | null;
    previous: string | null;
    next: string | null;
    listUrl: string;
};

export default function DeliveryLinks({ offerings, candidates, selected, previous, next, listUrl }: Props) {
    return (
        <main className="academic-core academic-register min-w-0 space-y-5">
            <Head title={selected ? 'Review offering — Delivery links' : 'Delivery links'} />
            <PageHeader
                title="Delivery links"
                description="Confirm which approved course revision a published school offering actually teaches."
            />
            {selected && (
                <DeliveryLinkDetails
                    key={selected.id}
                    offering={selected}
                    candidates={candidates}
                    listUrl={listUrl}
                />
            )}
            <RegistryPanel title="Published offerings" headingId={deliveryListHeadingId}>
                {offerings.length === 0 ? (
                    <p>{previous ? 'No published offerings on this page.' : 'No published school offerings yet.'}</p>
                ) : (
                    <ul className="divide-y rounded-md border">
                        {offerings.map(offering => {
                            const current = selected?.id === offering.id;

                            return (
                                <li key={offering.id}>
                                    <Link
                                        id={`delivery-row-${offering.id}`}
                                        href={offering.url}
                                        aria-current={current ? 'page' : undefined}
                                        className="register-row flex min-h-11 flex-wrap items-center justify-between gap-2 p-3 hover:underline"
                                        onSuccess={() => focusAfterRegistryNavigation(deliveryDetailHeadingId)}
                                    >
                                        <span className="min-w-0 wrap-anywhere">{offering.name}</span>
                                        {current && <span className="text-sm">Selected</span>}
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                )}
                <RegistryPagination
                    label="Published offering pages"
                    item="offerings"
                    previous={previous}
                    next={next}
                    headingId={deliveryListHeadingId}
                />
            </RegistryPanel>
        </main>
    );
}
