import type { DeliveryProps } from '../../components/academics/deliveryTypes';
import { OfferingPreparation } from '../../components/academics/OfferingPreparation';
import { Head, Link } from '@inertiajs/react';
import RecordForm from '../../components/academics/RecordForm';

type Pending = { offering_id: string; external_offering_id: string; revision: number };

export default function Delivery({ offerings, entries, terms, modes, pendingPlans }: DeliveryProps & { pendingPlans: Pending[] }) {
    return (
        <main className="mx-auto max-w-3xl space-y-5 px-5 py-12">
            <Head title="Offering delivery" />
            <Link href="/courses" className="underline">
                My courses
            </Link>
            <h1 className="text-3xl font-semibold">Offering delivery</h1>
            <p>Prepare an upstream section, assign its lecturer in the staff directory, then publish.</p>
            <section className="portal-panel p-4" aria-label="Pending teaching plans">
                <h2 className="font-semibold">Teaching plans awaiting review</h2>
                {pendingPlans.length ? <ul>{pendingPlans.map((p) => <li key={p.offering_id}>
                    <Link className="underline" href={`/courses/${p.offering_id}/learning/teaching-plan`}>Review {p.external_offering_id} · revision {p.revision}</Link>
                </li>)}</ul> : <p>No teaching plans awaiting review.</p>}
            </section>
            {!offerings.length && <p>No roster offerings yet.</p>}
            {offerings.map((o) => {
                const path = `/academics/delivery/${o.id}`;
                const prepare = ['draft', 'unpublished'].includes(o.status);
                return (
                    <details key={o.id} id={`offering-${o.id}`} open={new URLSearchParams(location.search).get('offering') === o.id} className="rounded border p-3">
                        <summary>
                            {o.external_offering_id} · {o.status}
                        </summary>
                        <p>
                            {entries.find((e) => e.id === o.curriculum_course_id)?.title ??
                                'No approved course linked'}{' '}
                            · {o.section ?? 'No section'} · {o.delivery_mode ?? 'No delivery mode'}
                        </p>
                        {o.copied_from && (
                            <p>
                                Copied from{' '}
                                {offerings.find((s) => s.id === o.copied_from)?.external_offering_id}
                            </p>
                        )}
                        <Link className="underline" href={`/courses/${o.id}/learning/teaching-plan`}>Teaching plan history</Link>
                        {prepare && (
                            <>
                                <OfferingPreparation
                                    {...{ o, path, entries, terms, modes, offerings }}
                                />
                                <RecordForm title="Publish offering" action={`${path}/publish`} />
                            </>
                        )}
                        {o.status === 'published' && (
                            <RecordForm title="Unpublish offering" action={`${path}/unpublish`} />
                        )}
                        {o.status !== 'archived' && (
                            <details>
                                <summary>Archive permanently</summary>
                                <RecordForm title="Archive offering" action={`${path}/archive`} />
                            </details>
                        )}
                    </details>
                );
            })}
        </main>
    );
}
