import RecordForm, { field, type Choice } from './RecordForm';
import { RegistryPanel } from './RegistryPanel';
import { RegistryReturnLink } from './RegistryReturnLink';
import { useRegistryActionFeedback } from './useRegistryActionFeedback';

export type SelectedOffering = Choice & { hasRevision: boolean; store: string };
export type DeliveryCandidate = Choice & { linked: boolean; blocked: boolean; note: string | null };
export const deliveryDetailHeadingId = 'delivery-detail-heading';
export const deliveryListHeadingId = 'delivery-list-heading';
const deliverySubmitId = 'delivery-link-submit';

export function DeliveryLinkDetails({ offering, candidates, listUrl }: {
    offering: SelectedOffering;
    candidates: DeliveryCandidate[];
    listUrl: string;
}) {
    const { message, reportSuccess, clearFeedback } = useRegistryActionFeedback(deliveryDetailHeadingId);
    const choices = candidates.filter(candidate => !candidate.linked && !candidate.blocked);
    const linked = candidates.filter(candidate => candidate.linked && !candidate.blocked);
    const blocked = candidates.filter(candidate => candidate.blocked);

    function reportConfirmation() {
        reportSuccess('Delivery link confirmed.', deliverySubmitId);
    }

    return (
        <RegistryPanel title={offering.name} headingId={deliveryDetailHeadingId}>
            <p className={message ? 'text-sm font-medium' : 'sr-only'} role="status">
                {message}
            </p>
            {!offering.hasRevision && choices.length > 0 && (
                <p className="text-sm text-muted-foreground">
                    The first link records the taught revision. Confirm it from the school’s teaching record before saving.
                </p>
            )}
            {linked.length > 0 && (
                <ul className="list-inside list-disc space-y-2 text-sm">
                    {linked.map(({ id, name, note }) => {
                        const status = note ? `Linked · ${note}` : 'Linked';

                        return (
                            <li key={id} className="wrap-anywhere">
                                {name} · {status}
                            </li>
                        );
                    })}
                </ul>
            )}
            {blocked.length > 0 && (
                <section aria-label="Delivery links needing reconciliation" className="space-y-2 border-l-2 border-border pl-3 text-sm">
                    <h3 className="font-semibold">Blocked: reconciliation required</h3>
                    <p>
                        These existing links have missing or inconsistent evidence.
                        Ask the academic delivery team to reconcile the links against the school’s teaching record.
                    </p>
                    <ul className="list-inside list-disc space-y-2">
                        {blocked.map(({ id, name }) => (
                            <li key={id} className="wrap-anywhere">{name}</li>
                        ))}
                    </ul>
                </section>
            )}
            {choices.length > 0 && (
                <RecordForm
                    title="Confirm delivery link"
                    action={offering.store}
                    fields={[
                        { ...field('assignment', 'Approved curriculum requirement', choices), showSelectedOption: true },
                        field('confirmation', 'Teaching record reference'),
                    ]}
                    submitId={deliverySubmitId}
                    resetOnSuccess
                    onStart={clearFeedback}
                    onSuccess={reportConfirmation}
                />
            )}
            {candidates.length === 0 && (
                <p>
                    No approved requirements match this offering.
                    Check the school’s taught revision against the approved curriculum before retrying.
                </p>
            )}
            {linked.length > 0 && choices.length === 0 && blocked.length === 0 && (
                <p>All matching approved requirements are linked.</p>
            )}
            <RegistryReturnLink
                href={listUrl}
                label="Back to published offerings"
                rowId={`delivery-row-${offering.id}`}
                listHeadingId={deliveryListHeadingId}
            />
        </RegistryPanel>
    );
}
