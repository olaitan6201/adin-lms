import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import type { DeliveryProps } from '../../components/academics/deliveryTypes';
import { OfferingPreparation } from '../../components/academics/OfferingPreparation';
import { Head, Link } from '@inertiajs/react';
import RecordForm from '../../components/academics/RecordForm';
import { RegistryFigures, RegistryPanel, RegistryTable } from '@/components/academics/RegistryPanel';
import { DeskHeading } from '@/components/academics/DeskHeading';

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
            <DeskHeading area="Course delivery" title="Offering delivery">Prepare an upstream section, assign its lecturer in the staff directory, then publish.</DeskHeading>
            <RegistryPanel title="Delivery pipeline" subtitle="Offerings by publication state">
            <RegistryFigures values={Object.fromEntries(['draft', 'published', 'unpublished', 'archived'].map(status => [
                status[0].toUpperCase() + status.slice(1), offerings.filter(o => o.status === status).length,
            ]))} />
            </RegistryPanel>
            <RegistryPanel title="Teaching plans awaiting review">
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
            </RegistryPanel>
            <RegistryPanel title="Course offerings" subtitle="Preparation, publication and teaching plan history">
            {!offerings.length && <p>No roster offerings yet.</p>}
            {offerings.length > 0 && <RegistryTable grouped title="Offering register" columns={['Course', 'Term', 'Mode', 'State', 'Actions']}>
            {offerings.map((o) => {
                const path = `/academics/delivery/${o.id}`;
                const prepare = ['draft', 'unpublished'].includes(o.status);
                return (
                    <Collapsible
                        key={o.id}
                        id={`offering-${o.id}`}
                        defaultOpen={new URLSearchParams(location.search).get('offering') === o.id}
                        asChild
                    ><tbody><tr>
                        <td><strong>{entries.find(e => e.id === o.curriculum_course_id)?.title ?? 'No approved course linked'}</strong>
                            <div className="font-mono text-xs text-ink-500">{o.external_offering_id}</div></td>
                        <td><span className="sm:hidden">Term: </span>{terms.find(t => t.id === o.semester_id)?.label ?? 'Not assigned'}</td>
                        <td><span className="sm:hidden">Mode: </span>{o.delivery_mode ?? 'Not assigned'}</td>
                        <td><span className={o.status === 'published' ? 'badge bg-brand-50 text-brand-700' : 'badge bg-ink-50 text-ink-600'}>{o.status}</span></td>
                        <td>
                        <CollapsibleTrigger asChild>
                            <Button type="button" variant="outline" aria-label={`Manage ${o.external_offering_id} · ${o.status}`}>
                                Manage
                            </Button>
                        </CollapsibleTrigger>
                        </td></tr>
                        <CollapsibleContent asChild forceMount className="data-[state=closed]:hidden"><tr><td colSpan={5} className="space-y-3">
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
                        </td></tr></CollapsibleContent></tbody>
                    </Collapsible>
                );
            })}</RegistryTable>}
            </RegistryPanel>
        </main>
    );
}
