import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import type { DeliveryProps } from '../../components/academics/deliveryTypes';
import { OfferingPreparation } from '../../components/academics/OfferingPreparation';
import { Head, Link } from '@inertiajs/react';
import RecordForm from '../../components/academics/RecordForm';

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
        <main className="mx-auto max-w-3xl space-y-5 px-5 py-12">
            <Head title="Offering delivery" />
            <Link href="/courses" className="text-primary underline underline-offset-4">
                My courses
            </Link>
            <h1 className="text-3xl font-semibold">Offering delivery</h1>
            <p>Prepare an upstream section, assign its lecturer in the staff directory, then publish.</p>
            <section className="space-y-2 rounded-lg border p-4" aria-label="Pending teaching plans">
                <h2 className="font-semibold">Teaching plans awaiting review</h2>
                {pendingPlans.length ? (
                    <ul>
                        {pendingPlans.map((p) => (
                            <li key={p.offering_id}>
                                <Link className="text-primary underline underline-offset-4" href={`/courses/${p.offering_id}/learning/teaching-plan`}>
                                    Review {p.external_offering_id} · revision {p.revision}
                                </Link>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>No teaching plans awaiting review.</p>
                )}
            </section>
            {!offerings.length && <p>No roster offerings yet.</p>}
            {offerings.map((o) => {
                const path = `/academics/delivery/${o.id}`;
                const prepare = ['draft', 'unpublished'].includes(o.status);
                return (
                    <Collapsible
                        key={o.id}
                        id={`offering-${o.id}`}
                        defaultOpen={new URLSearchParams(location.search).get('offering') === o.id}
                        className="rounded border p-3"
                    >
                        <CollapsibleTrigger asChild>
                            <Button type="button" variant="outline" className="h-auto min-h-9 max-w-full whitespace-normal text-start">
                                {o.external_offering_id} · {o.status}
                            </Button>
                        </CollapsibleTrigger>
                        <CollapsibleContent forceMount className="space-y-3 pt-3 data-[state=closed]:hidden">
                            <p>
                                {entries.find((e) => e.id === o.curriculum_course_id)?.title ?? 'No approved course linked'}{' '}
                                · {o.section ?? 'No section'} · {o.delivery_mode ?? 'No delivery mode'}
                            </p>
                            {o.copied_from && (
                                <p>Copied from {offerings.find((s) => s.id === o.copied_from)?.external_offering_id}</p>
                            )}
                            <Link className="text-primary underline underline-offset-4" href={`/courses/${o.id}/learning/teaching-plan`}>
                                Teaching plan history
                            </Link>
                            {prepare && (
                                <>
                                    <OfferingPreparation {...{ o, path, entries, terms, modes, offerings }} />
                                    <RecordForm title="Publish offering" action={`${path}/publish`} />
                                </>
                            )}
                            {o.status === 'published' && (
                                <RecordForm title="Unpublish offering" action={`${path}/unpublish`} />
                            )}
                            {o.status !== 'archived' && (
                                <Collapsible>
                                    <CollapsibleTrigger asChild>
                                        <Button type="button" variant="outline" className="h-auto min-h-9 max-w-full whitespace-normal text-start">
                                            Archive permanently
                                        </Button>
                                    </CollapsibleTrigger>
                                    <CollapsibleContent forceMount className="space-y-3 pt-3 data-[state=closed]:hidden">
                                        <RecordForm title="Archive offering" action={`${path}/archive`} />
                                    </CollapsibleContent>
                                </Collapsible>
                            )}
                        </CollapsibleContent>
                    </Collapsible>
                );
            })}
        </main>
    );
}
