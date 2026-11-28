import RecordForm, { field, type Choice } from './RecordForm';

export type PlacementEnrolment = {
    id: string;
    offering: string | null;
    section: string | null;
    linked: boolean;
    linkedHere: boolean;
};

function unlinkedChoices(enrolments: PlacementEnrolment[]): Choice[] {
    return enrolments.flatMap(({ id, linked, offering, section }) => {
        if (linked || !offering) {
            return [];
        }

        return [{ id, name: section ? `${offering} · ${section}` : offering }];
    });
}

export function PlacementEnrolmentReview({ enrolments, action, submitId, onStart, onSuccess }: {
    enrolments: PlacementEnrolment[];
    action: string | null;
    submitId: string;
    onStart: () => void;
    onSuccess: () => void;
}) {
    const choices = unlinkedChoices(enrolments);
    const linked = enrolments.filter(record => record.linked);
    const hasChoices = choices.length > 0;

    return (
        <>
            {linked.length > 0 && (
                <ul className="list-inside list-disc space-y-1 text-sm">
                    {linked.map(({ id, offering, linkedHere }) => {
                        const label = offering ?? 'Offering without a school ID';
                        const status = linkedHere ? 'Linked' : 'Linked to another placement';

                        return (
                            <li key={id} className="wrap-anywhere">
                                {label} · {status}
                            </li>
                        );
                    })}
                </ul>
            )}
            {hasChoices && action && (
                <div>
                    <p className="text-sm text-muted-foreground">
                        Choose an unlinked school enrolment. Saving checks the official placement dates and the confirmed delivery link.
                    </p>
                    <RecordForm
                        title="Link enrolment"
                        action={action}
                        fields={[{ ...field('enrolment_id', 'Enrolment', choices), showSelectedOption: true }]}
                        submitId={submitId}
                        resetOnSuccess
                        onStart={onStart}
                        onSuccess={onSuccess}
                    />
                </div>
            )}
            {!hasChoices && (
                <p className="text-sm text-muted-foreground">
                    No unlinked enrolments with a school offering ID for this student and session.
                </p>
            )}
        </>
    );
}
