type MembershipChange = {
    enrolment_id: string;
    label: string;
};

export type GroupHistory = {
    id: string;
    occurred_at: string;
    actor: string;
    details: {
        name_before: string | null;
        name_after: string;
        added: MembershipChange[];
        removed: MembershipChange[];
    };
};

export function MembershipHistory({ entries }: { entries: GroupHistory[] }) {
    if (!entries.length) {
        return <p>No membership changes recorded.</p>;
    }

    return (
        <ol className="space-y-4">
            {entries.map((entry) => {
                const rename =
                    entry.details.name_before === null
                        ? `Created as “${entry.details.name_after}”.`
                        : entry.details.name_before !== entry.details.name_after
                          ? `Renamed from “${entry.details.name_before}” to “${entry.details.name_after}”.`
                          : 'Membership updated.';

                return (
                    <li key={entry.id} className="border-t pt-3">
                        <p className="text-sm text-muted-foreground">
                            <time dateTime={entry.occurred_at}>{new Date(entry.occurred_at).toLocaleString()}</time>
                            {' · '}
                            {entry.actor}
                        </p>
                        <p>{rename}</p>
                        {entry.details.added.length > 0 && (
                            <div>
                                <h4 className="font-medium">Added</h4>
                                <ul className="list-disc pl-5">
                                    {entry.details.added.map((member) => (
                                        <li key={member.enrolment_id}>{member.label}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        {entry.details.removed.length > 0 && (
                            <div>
                                <h4 className="font-medium">Removed</h4>
                                <ul className="list-disc pl-5">
                                    {entry.details.removed.map((member) => (
                                        <li key={member.enrolment_id}>{member.label}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </li>
                );
            })}
        </ol>
    );
}
