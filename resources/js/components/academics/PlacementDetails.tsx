import RecordForm, { field } from './RecordForm';
import { PlacementEnrolmentReview, type PlacementEnrolment } from './PlacementEnrolmentReview';
import { RegistryPanel } from './RegistryPanel';
import { RegistryReturnLink } from './RegistryReturnLink';
import { useRegistryActionFeedback } from './useRegistryActionFeedback';

export const placementDetailHeadingId = 'placement-detail-heading';
export const placementListHeadingId = 'placement-list-heading';
const linkSubmitId = 'placement-link-submit';

export type PlacementRow = {
    id: string;
    registration: string;
    number: number;
    accepted: boolean;
    nextNumber: number;
    url: string;
    disposition?: 'ready_for_review' | 'held_for_earlier_update' | 'exact_replay' | 'conflict';
};

export type SelectedPlacement = PlacementRow & {
    student: string;
    effectiveOn: string;
    pathway: string;
    session: string;
    cohort: string;
    level: string;
    curriculumVersion: number | null;
    approvalNote: string | null;
    requiresReason: boolean;
};

export function PlacementDetails({ row, approve, link, enrolments, listUrl }: {
    row: SelectedPlacement;
    approve: string | null;
    link: string | null;
    enrolments: PlacementEnrolment[];
    listUrl: string;
}) {
    const { message, reportSuccess, clearFeedback } = useRegistryActionFeedback(placementDetailHeadingId);
    const facts = [
        ['Student ID', row.student],
        ['Start date', row.effectiveOn],
        ['Pathway', row.pathway],
        ['Session', row.session],
        ['Cohort', row.cohort],
        ['Level', row.level],
    ];

    function reportApproval() {
        reportSuccess('Placement approved.');
    }

    function reportEnrolmentLink() {
        reportSuccess('Enrolment linked.', linkSubmitId);
    }

    const reasonField = {
        ...field('reason', 'Reason for change'),
        optional: !row.requiresReason,
        description: row.requiresReason ? 'Required when the pathway or cohort changes.' : 'Optional for this update.',
    };
    const awaitingEarlierUpdate = !row.accepted && row.number !== row.nextNumber;

    return (
        <RegistryPanel title={`${row.registration} · Update ${row.number}`} headingId={placementDetailHeadingId}>
            <p className={message ? 'text-sm font-medium' : 'sr-only'} role="status">
                {message}
            </p>
            <dl className="grid min-w-0 gap-3 text-sm sm:grid-cols-2">
                {facts.map(([label, value]) => (
                    <div key={label} className="min-w-0">
                        <dt className="font-medium">{label}</dt>
                        <dd className="wrap-anywhere text-muted-foreground">{value}</dd>
                    </div>
                ))}
            </dl>
            {row.accepted && (
                <div className="space-y-3">
                    <p>Approved · Curriculum version {row.curriculumVersion}</p>
                    {row.approvalNote && <p className="wrap-anywhere">{row.approvalNote}</p>}
                    <PlacementEnrolmentReview
                        enrolments={enrolments}
                        action={link}
                        submitId={linkSubmitId}
                        onStart={clearFeedback}
                        onSuccess={reportEnrolmentLink}
                    />
                </div>
            )}
            {awaitingEarlierUpdate && (
                <p>On hold. Review update {row.nextNumber} first.</p>
            )}
            {!row.accepted && !awaitingEarlierUpdate && approve && (
                <div>
                    <p className="text-sm text-muted-foreground">
                        {row.requiresReason && 'Transfers cannot start before approval. '}
                        Old grades and enrolment links stay in place.
                    </p>
                    <RecordForm
                        title="Approve placement"
                        action={approve}
                        fields={[reasonField]}
                        onStart={clearFeedback}
                        onSuccess={reportApproval}
                    />
                </div>
            )}
            <RegistryReturnLink
                href={listUrl}
                label="Back to placement updates"
                rowId={`placement-row-${row.id}`}
                listHeadingId={placementListHeadingId}
            />
        </RegistryPanel>
    );
}
