import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import type { DeliveryProps } from './deliveryTypes';
import { OfferingPreparation } from './OfferingPreparation';
import { Link } from '@inertiajs/react';
import RecordForm from './RecordForm';

export function OfferingRegisterRow({
    o,
    entries,
    terms,
    modes,
    offerings,
}: DeliveryProps & { o: DeliveryProps['offerings'][number] }) {
    const path = `/academics/delivery/${o.id}`;
    const prepare = ['draft', 'unpublished'].includes(o.status);
    const courseTitle =
        entries.find((entry) => entry.id === o.curriculum_course_id)?.title ?? 'No approved course linked';

    return (
        <Collapsible
            id={`offering-${o.id}`}
            defaultOpen={new URLSearchParams(location.search).get('offering') === o.id}
            asChild
        >
            <tbody>
                <tr>
                    <td>
                        <strong>{courseTitle}</strong>
                        <div className="font-mono text-xs text-ink-500">{o.external_offering_id}</div>
                    </td>
                    <td>
                        <span className="sm:hidden">Term: </span>
                        {terms.find((t) => t.id === o.semester_id)?.label ?? 'Not assigned'}
                    </td>
                    <td>
                        <span className="sm:hidden">Mode: </span>
                        {o.delivery_mode ?? 'Not assigned'}
                    </td>
                    <td>
                        <span
                            className={
                                o.status === 'published'
                                    ? 'badge bg-brand-50 text-brand-700'
                                    : 'badge bg-ink-50 text-ink-600'
                            }
                        >
                            {o.status}
                        </span>
                    </td>
                    <td>
                        <CollapsibleTrigger asChild>
                            <Button
                                type="button"
                                variant="outline"
                                aria-label={`Manage ${o.external_offering_id} · ${o.status}`}
                            >
                                Manage
                            </Button>
                        </CollapsibleTrigger>
                    </td>
                </tr>
                <CollapsibleContent asChild forceMount className="data-[state=closed]:hidden">
                    <tr>
                        <td colSpan={5} className="space-y-3">
                            <p>
                                {courseTitle} · {o.section ?? 'No section'} · {o.delivery_mode ?? 'No delivery mode'}
                            </p>
                            {o.copied_from && (
                                <p>Copied from {offerings.find((s) => s.id === o.copied_from)?.external_offering_id}</p>
                            )}
                            <Link
                                className="text-primary underline underline-offset-4"
                                href={`/courses/${o.id}/learning/teaching-plan`}
                            >
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
                                        <Button
                                            type="button"
                                            variant="outline"
                                            className="h-auto min-h-9 max-w-full whitespace-normal text-start"
                                        >
                                            Archive permanently
                                        </Button>
                                    </CollapsibleTrigger>
                                    <CollapsibleContent
                                        forceMount
                                        className="space-y-3 pt-3 data-[state=closed]:hidden"
                                    >
                                        <RecordForm title="Archive offering" action={`${path}/archive`} />
                                    </CollapsibleContent>
                                </Collapsible>
                            )}
                        </td>
                    </tr>
                </CollapsibleContent>
            </tbody>
        </Collapsible>
    );
}
