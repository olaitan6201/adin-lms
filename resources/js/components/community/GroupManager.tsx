import { Input } from '@/components/ui/input';
import { NativeCheckbox } from '@/components/ui/native-checkbox';
import { EntryForm } from './Elements';

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

export type Group = {
    id: string;
    name: string;
    members: { enrolment_id: string }[];
    history: GroupHistory[];
};

export type Registration = {
    id: string;
    label: string;
};

function MembershipHistory({ entries }: { entries: GroupHistory[] }) {
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
                        <p className="text-sm text-gray-600">
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

export function GroupManager({
    base,
    groups,
    registrations,
}: {
    base: string;
    groups: Group[];
    registrations: Registration[];
}) {
    const editor = (team?: Group) => (
        <EntryForm
            action={`${base}/groups${team ? `/${team.id}` : ''}`}
            title={team ? 'Save membership' : 'Create study group'}
            body={false}
        >
            <label>
                Group name
                <Input
                    name="name"
                    required
                    maxLength={191}
                    defaultValue={team?.name}
                />
            </label>
            <fieldset>
                <legend>Registered learners</legend>
                {registrations.map((person) => (
                    <label key={person.id} className="flex items-center gap-2 py-1">
                        <NativeCheckbox
                            name="members[]"
                            value={person.id}
                            defaultChecked={team?.members.some((member) => member.enrolment_id === person.id)}
                        />
                        {person.label}
                    </label>
                ))}
            </fieldset>
        </EntryForm>
    );

    return (
        <section id="study-groups" aria-labelledby="study-groups-heading" className="space-y-3">
            <h2 id="study-groups-heading" className="text-xl font-semibold">
                Study groups
            </h2>
            {!groups.length && <p>No study groups yet.</p>}
            {groups.map((team) => (
                <details key={team.id}>
                    <summary className="cursor-pointer py-2">{team.name} · Edit membership</summary>
                    {editor(team)}
                    <details className="mt-3 border-t pt-3">
                        <summary className="cursor-pointer py-2">Membership history</summary>
                        <MembershipHistory entries={team.history} />
                    </details>
                </details>
            ))}
            <details>
                <summary className="cursor-pointer py-2">New study group</summary>
                {editor()}
            </details>
        </section>
    );
}
